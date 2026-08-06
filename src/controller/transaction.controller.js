import express from "express";
import Transaction from "../model/transaction.model.js";
import Ledger from "../model/ledger.model.js";
import Account from "../model/account.model.js";
import { sendTransactionEmail } from "../services/email.service.js";

/**
 *  Create a new transaction between two accounts. This function handles the creation of a transaction, including validation, idempotency checks, and ledger updates. It ensures that the transaction is processed correctly and that duplicate transactions are avoided.
 */
export async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  console.log("createTransaction received idempotencyKey:", idempotencyKey);

  /**
   * 1. Validate the request body to ensure that all required fields are present. If any required field is missing, return a 400 Bad Request response with an appropriate error message.
   */

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const fromUserAccount = await Account.findOne({ _id: fromAccount });

  const toUserAccount = await Account.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({ message: "One or both accounts not found" });
  }

  /**
   * 2. Check if the transaction with the same idempotency key already exists in the database. If it does, return the status of that transaction instead of creating a new one. This ensures that if the client retries the request due to network issues or timeouts, it won't create duplicate transactions.
   */
  const isTransactionExists = await Transaction.findOne({
    idempotencyKey: idempotencyKey,
  });
  if (isTransactionExists) {
    if (isTransactionExists.status === "completed") {
      return res.status(200).json({ message: "Transaction Already completed" });
    }
    if (isTransactionExists.status === "pending") {
      return res
        .status(200)
        .json({ message: "Transaction is still processing" });
    }
    if (isTransactionExists.status === "failed") {
      return res
        .status(500)
        .json({ message: "Transaction processing has failed" });
    }
    if (isTransactionExists.status === "reversed") {
      return res
        .status(500)
        .json({ message: "Transaction has been reversed, Please Retry!" });
    }
  }

  /**
   * 3. check status of account status
   */

  if (
    fromUserAccount.status !== "Active" ||
    toUserAccount.status !== "Active"
  ) {
    return res
      .status(400)
      .json({ message: "One or both accounts are not active" });
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance();
  if (balance < amount) {
    return res
      .status(400)
      .json({
        message: `Insufficient balance, Current Balance is ${balance}. Requested amount is ${amount}`,
      });
  }

  /**
   * 5. create session and transaction
   */

  const session = await Transaction.startSession();
  let transaction;

  try {
    session.startTransaction()

      ;[transaction] = await Transaction.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "pending",
      }], { session })

    // Atomic overdraft guard: the $gte condition and the decrement happen in one
    // write, so concurrent transfers on the same account can't both pass a stale check.
    const debitedAccount = await Account.findOneAndUpdate(
      { _id: fromAccount, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { session, new: true }
    )
    if (!debitedAccount) {
      throw new Error("Insufficient balance")
    }
    await Account.findOneAndUpdate(
      { _id: toAccount },
      { $inc: { balance: amount } },
      { session }
    )

    await Ledger.create([{
      account: fromAccount,
      amount: amount,
      transaction: transaction._id,
      type: "debit"
    }], { session })

    await Ledger.create([{
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "credit"
    }], { session })


    transaction.status = "completed"
    await transaction.save({ session })

    await session.commitTransaction()
  } catch (error) {
    await session.abortTransaction()
    await Transaction.findOneAndUpdate({
      idempotencyKey: idempotencyKey
    }, {
      status: "failed"
    })
    return res.status(400).json({ message: "Transaction is pending due to an issue please retry after sometime", error: error.message });
  } finally {
    session.endSession()
  }

  /**
  * Send email conformation
  */
  await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
  return res.status(201).json({
    message: "Transaction completed Successfully",
    transaction: transaction
  })
}




/**
 *  Funds transaction from system account to user account, this is used to create initial funds for a user account
 */

export async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const toUserAccount = await Account.findOne({ _id: toAccount });

  if (!toUserAccount) {
    return res.status(404).json({ message: "Account not found" });
  }

  const fromUserAccount = await Account.findOne({ user: req.user._id });

  if (!fromUserAccount) {
    return res.status(404).json({ message: "System account not found" });
  }

  /**
   * 2. Check if the transaction with the same idempotency key already exists in the database. If it does, return the status of that transaction instead of creating a new one. This ensures that if the client retries the request due to network issues or timeouts, it won't create duplicate transactions.
   */

  const isTransactionExists = await Transaction.findOne({
    idempotencyKey: idempotencyKey,
  });
  if (isTransactionExists) {
    if (isTransactionExists.status === "completed") {
      return res.status(200).json({ message: "Transaction Already completed" });
    }
    if (isTransactionExists.status === "pending") {
      return res
        .status(200)
        .json({ message: "Transaction is still processing" });
    }
    if (isTransactionExists.status === "failed") {
      return res
        .status(500)
        .json({ message: "Transaction processing has failed" });
    }
    if (isTransactionExists.status === "reversed") {
      return res
        .status(500)
        .json({ message: "Transaction has been reversed, Please Retry!" });
    }
  }

  const session = await Transaction.startSession();
  session.startTransaction()

  const [transaction] = await Transaction.create([{
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "pending",
  }], { session })

  const [debitLedgerEntry] = await Ledger.create([{
    account: fromUserAccount._id,
    amount: amount,
    transaction: transaction._id,
    type: "debit"
  }], { session })

  const [creditLedgerEntry] = await Ledger.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "credit"
  }], { session })

  // System account mints funds, so no $gte guard here — only the recipient's
  // cached balance needs to stay in sync with the ledger.
  await Account.findOneAndUpdate(
    { _id: fromUserAccount._id },
    { $inc: { balance: -amount } },
    { session }
  )
  await Account.findOneAndUpdate(
    { _id: toAccount },
    { $inc: { balance: amount } },
    { session }
  )

  transaction.status = "completed"
  await transaction.save({ session })

  await session.commitTransaction()
  session.endSession()

  return res.status(201).json({
    message: "Initial Funds Transaction completed Successfully",
    transaction: transaction
  })
}
