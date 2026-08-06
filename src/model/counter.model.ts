import mongoose, { Document, Types } from "mongoose";

export interface ICounter extends Document {
  _id: Types.ObjectId;
  year: string;
  sequence: number;
}

const counterSchema = new mongoose.Schema<ICounter>({
  year: {
    type: String,
    required: true,
    unique: true
  },

  sequence: {
    type: Number,
    default: 0
  }
});

const Counter = mongoose.model<ICounter>(
  "Counter",
  counterSchema
);

export default Counter;
