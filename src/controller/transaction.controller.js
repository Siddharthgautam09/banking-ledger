import express from "express";
import Transaction from "../model/transaction.model.js";
import Ledger from "../model/ledger.model.js";
import Account from "../model/account.model.js";
import { sendTransactionEmail } from "../services/email.service.js";


export async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  /**
   * 1. Validate the request body to ensure that all required fields are present. If any required field is missing, return a 400 Bad Request response with an appropriate error message.
   */

  if (!fromAccount || !toAccount|| !amount || !idempotencyKey) {
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
    fromUserAccount.status !== "active" ||
    toUserAccount.status !== "active"
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
  session.startTransaction()

  const [transaction] = await Transaction.create([{
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "pending",
  }],{session})

  const [debitLedgerEntry] = await Ledger.create([{
    account:fromAccount,
    amount: amount,
    transaction:transaction._id,
    type:"debit"
  }],{session})

  const [creditLedgerEntry] = await Ledger.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "credit"
  }],{session})

  transaction.status="completed"
  await transaction.save({session})

  await session.commitTransaction()
  session.endSession()

  /**
   * Send email conformation
   */

  await sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

  return res.status(201).json({
    message:"Transactiopn completed Successfully",
    transaction:transaction
  })
  
}

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
  }],{session})

  const [debitLedgerEntry] = await Ledger.create([{
    account: fromUserAccount._id,
    amount: amount,
    transaction: transaction._id,
    type: "debit"
  }],{session})

  const [creditLedgerEntry] = await Ledger.create([{
    account: toAccount,
    amount: amount,
    transaction: transaction._id,
    type: "credit"
  }],{session})

  transaction.status="completed"
  await transaction.save({session})

  await session.commitTransaction()
  session.endSession()
  
  return res.status(201).json({
    message:"Initial Funds Transaction completed Successfully",
    transaction:transaction
  })
}
