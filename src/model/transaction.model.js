import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({

    fromAccount:{
        types: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: [true , "Transactions must be associated with a from account"],
        index: true
    },
    toAccount:{
        types: mongoose.Schema.Types.ObjectId,
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


const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;