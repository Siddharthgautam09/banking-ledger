
import express from 'express';

import { authMiddleware } from '../middleware/auth.middleware.js'
import createAccountController from '../controller/account.controller.js';

const accountRouter = express.Router();

/**
 * -POST /api/accounts/
 * - Create a new account
 * -Protected route
 * 
 */
accountRouter.post('/',authMiddleware, createAccountController)


export default accountRouter;
