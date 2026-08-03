import express from "express";
import mongoose from "mongoose";
import Ledger from "./ledger.model.js";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account must belong to a user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Active", "Closed", "Frozen"],
        message: "Account Status can be either Active, Closed or Frozen",
      },
      default: "Active",
    },
    currency: {
      type: String,
      enum: {
        values: ["USD", "EUR", "GBP", "JPY", "INR"],
        message: "Currency can be either USD, EUR, GBP or JPY",
      },
      required: true,
      default: "INR",
    },
    accountType: {
      type: String,
      enum: ["Savings", "Current"],
      required: true,
      default: "Savings",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

//compound index to ensure that a user can have only one account of a particular status
accountSchema.index({ user: 1, status: 1 }, { unique: true });

accountSchema.methods.getBalance = async function () {
  const balanceData = await Ledger.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);
  if(balanceData.length===0){
    return 0
  }
  return balanceData[0].balance;
};

export const Account = mongoose.model("Account", accountSchema);

export default Account;
