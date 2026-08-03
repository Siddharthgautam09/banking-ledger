import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({

    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required:[true, "Ledger must be associated with an account"],
        index: true,
        immutable: true
    },
    amount:{
        type:Number,
        required:[true, "Amount is reequired for creating a ledger entry"],
        immutable: true
    },
    transcation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Ledger must be associated with a transaction"],
        immutable: true,
        index:true
    },
    type:{
       type:String,
       enum:{
        values: ["credit" , "debit"],
        message: "Type can be either credit or debit"
       },
       required:[true, "Ledger type is required"],
       immutable:true
    }
},{timestamps:true})

function preventLedgerModification(){
    throw new Error("Ledger entries cannot be modified or deleted once created");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const Ledger = mongoose.model ("Ledger", ledgerSchema )

export default Ledger;