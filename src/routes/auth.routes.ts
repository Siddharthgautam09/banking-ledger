import express from 'express'

import { userRegisterController, getUserController, userLoginController, userLogoutController } from '../controller/auth.controller.js'

const authRouter = express.Router()

/* {/api/auth/register} is going to be the route */
authRouter.post('/register', userRegisterController)

authRouter.get('/user/:id', getUserController)

authRouter.post('/login', userLoginController)

authRouter.post('/logout', userLogoutController)



export default authRouter
