import mongoose from 'mongoose'

const TokenblacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to add in blacklist"],
        unique: [true, "Token already exist in blacklist"]
    },
}, {
    timestamps: true
})

TokenblacklistSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3
}) // 3 days in seconds

const TokenBlacklist = mongoose.model('TokenBlacklist', TokenblacklistSchema)

export default TokenBlacklist