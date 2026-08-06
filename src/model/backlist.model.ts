import mongoose, { Document, Types } from 'mongoose'

export interface ITokenBlacklist extends Document {
    _id: Types.ObjectId;
    token: string;
}

const TokenblacklistSchema = new mongoose.Schema<ITokenBlacklist>({
    token: {
        type: String,
        required: [true, "Token is required to add in blacklist"],
        unique: true
    },
}, {
    timestamps: true
})

TokenblacklistSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3
}) // 3 days in seconds

const TokenBlacklist = mongoose.model<ITokenBlacklist>('TokenBlacklist', TokenblacklistSchema)

export default TokenBlacklist
