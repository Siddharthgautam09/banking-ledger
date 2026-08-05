import Account from '../model/account.model.js'


/**
 * - Create account for a authorized user
 */

export  async function createAccountController ( req, res){

    const user = req.user;

    const account =  await Account.create({
        user:user._id
    })

    return res.status(201).json({
        message:"Account created Successfully",
        account
    })

}


/**
 * -GET balance of an account associated to the user
 */

export async function getAccountBalanceController(req, res) {

    const {accountId} =  req.params;

    const account = await Account.findOne({

        _id: accountId,
        user: req.user._id

    })

    if(!account){
        res.status(404).json({
            message:"Account Not Found"
        })
    }

    const balance = await account.getBalance();

    res.status(200).json({
        message:"Balance Successfully Fetched",
        account:account._id,
        balance,

    })

}

/**
 *  -GET ACCOUNTS ASSOCIATED WITH A USER
 */

export async function getaccountController(req,res){

    const user= req.user;

    const accounts = await Account.find({
        user: user._id
    })

    return res.status(200).json({
        message:"Account Fetched Sucessfully",
        user:user._id,
        accounts

    })
}
