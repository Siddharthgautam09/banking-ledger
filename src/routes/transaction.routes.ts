import express from 'express';
import { authMiddleware, authSystemUserMiddleware } from '../middleware/auth.middleware.js'
import { createTransaction, createInitialFundsTransaction } from '../controller/transaction.controller.js';

const transactionRouter = express.Router();

transactionRouter.post('/', authMiddleware, createTransaction)

/**
 *  -POST /api/transactions/system/inital-funds
 * - Create initial funds for the system account. This route is protected and requires authentication.
 */

transactionRouter.post('/system/initial-funds', authSystemUserMiddleware, createInitialFundsTransaction);

export default transactionRouter;
