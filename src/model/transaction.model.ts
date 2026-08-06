import mongoose, { Document, Types } from 'mongoose';

export type TransactionStatus = "pending" | "completed" | "failed" | "reversed";

export interface ITransaction extends Document {
    _id: Types.ObjectId;
    fromAccount: Types.ObjectId;
    toAccount: Types.ObjectId;
    status: TransactionStatus;
    amount: number;
    idempotencyKey: string;
}

const transactionSchema = new mongoose.Schema<ITransaction>({

    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true , "Transactions must be associated with a from account"],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true , "Transactions must be associated with a to account"],
        index: true
    },
    status:{
        type:String,
        enum:{
            values: ["pending", "completed", "failed", "reversed"],
            message: "Status can be either pending, complted, failed or reversed"
        },
        default:"pending"
    },
    amount:{
        type: Number,
        required:[true, "Amount is needed to make a Transaction"],
        min:[1, "Transaction must be greater than 1"]
    },

    // Always generated from client side not from server side
    idempotencyKey:{
        type:String,
        required: [true, "Idempotency Key is required for creating a transaction"],
        index:true,
        unique:true
    }
},{
    timestamps: true
})


const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
