import UserModel from '../model/user.model.js'

import jwt from 'jsonwebtoken'



export default async function authMiddleware(req,res,next){

    const token  =  req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"Unauthorized acess, token is missing"
        })
    }

    try{
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await UserModel.findById(decoded.userId).select("-password")

        req.user=user

        return next()

      }catch(error){
        return res.status(401).json({
            message:"Unauthorized access, token is invalid !"
        })
    }
}
