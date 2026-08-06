import UserModel from '../model/user.model.js'
import TokenBlacklist from '../model/backlist.model.js'
import jwt from 'jsonwebtoken'



export async function authMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized acess, token is missing"
        })
    }

    const isBlacklisted = await TokenBlacklist.findOne({ token: token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await UserModel.findById(decoded.userId).select("-password")

        req.user = user

        return next()

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid !"
        })
    }
}


export async function authSystemUserMiddleware(req, res, next) {

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized acess, token is missing"
        })
    }

    const isBlacklisted = await TokenBlacklist.findOne({ token: token })

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized access, token is blacklisted"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await UserModel.findById(decoded.userId).select("+systemUser").select("-password")

        if (!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden access, only system user can perform this action"
            })
        }

        req.user = user

        return next()

    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid !"
        })
    }
}   