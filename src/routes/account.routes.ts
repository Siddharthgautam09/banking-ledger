
import express from 'express';

import { authMiddleware } from '../middleware/auth.middleware.js'
import { createAccountController, getAccountBalanceController, getaccountController, } from '../controller/account.controller.js';

const accountRouter = express.Router();

/**
 * -POST /api/accounts/
 * - Create a new account
 * -Protected route
 *
 */
accountRouter.post('/', authMiddleware, createAccountController)

/**
 *   -GET /api/accounts/balance/:accountId
 *  - Get the balance of an account by accountId
 *   - Protected route
 *
 */
accountRouter.get('/balance/:accountId', authMiddleware, getAccountBalanceController)


/**
 *  -GET /api/accounts/
 */
accountRouter.get('/', authMiddleware, getaccountController)


export default accountRouter;
