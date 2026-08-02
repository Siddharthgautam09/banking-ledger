import UserModel from '../model/user.model.js'
import jwt from 'jsonwebtoken'
import Counter from '../model/counter.model.js'

import sendEmail from '../services/email.service.js';


export async function userRegisterController(req,res){

    const{ email, password, name } = req.body

    const isExist = await UserModel.findOne({
        email: email
    })
    if(isExist){
        return res.status(422).json({
            message:"USER already exists",
            status:"failed"
        })
    }

    // Get the last two digits of the current year
    const year = String(new Date().getFullYear()).slice(-2);
    // Atomically increase sequence
    const counter =await Counter.findOneAndUpdate({year},{$inc: {sequence: 1}},{returnDocument: 'after',upsert: true});

    const userId =
      `USER-${year}${String(
        counter.sequence
      ).padStart(3, "0")}`;


    const user = await UserModel.create({
        email, password, name, userId
    })

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN})

    res.cookie("token",token)

    res.status(201).json({
        message: "User is created Sucessfully",
        status: "Success",
        user:{
            _id: user._id,
            userId: user.userId,
            email: user.email,
            name: user.name
        },
        token
    })
    await sendEmail(user.email, user.name);

}

export async function getUserController(req,res){
    const { id } = req.params

    const userId = `USER-${id}`

    const user = await UserModel.findOne({ userId })

    if(!user) {
        return res.status(404).json({
            message: "User not found",
            status: "failed"
        })
    }

    res.status(200).json({
        message: "User fetched successfully",   
        user
    })

}

export async function userLoginController(req,res){
    const { email, password } = req.body

    const user = await UserModel.findOne({ email }).select('+password')

    if(!user){
        return res.status(404).json({
            message: "User not found",
            status: "failed"
        })
    }
    const isPasswordMatched = await user.comparePassword(password)
    if(!isPasswordMatched){
        return res.status(401).json({
            message: "Invalid credentials",
            status: "failed"
        })
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN})

    res.cookie("token",token)

    res.status(200).json({
        message: "User logged in successfully",
        status: "success",
        token
    })
}   