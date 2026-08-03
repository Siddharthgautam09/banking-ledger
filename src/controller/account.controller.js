import Account from '../model/account.model.js'


/**
 * - Create account for a authorized user
 */

export default async function createAccountController ( req, res){

    const user = req.user;

    const account =  await Account.create({
        user:user._id
    })

    return res.status(201).json({
        message:"Account created Successfully",
        account
    })

}