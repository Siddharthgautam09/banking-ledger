import express from 'express'

import { userRegisterController, getUserController , userLoginController} from '../controller/auth.controller.js'

const authRouter = express.Router()

/* {/api/auth/register} is going to be the route */
authRouter.post('/register',userRegisterController)

authRouter.get('/user/:id', getUserController)

authRouter.post('/login', userLoginController)



export default authRouter