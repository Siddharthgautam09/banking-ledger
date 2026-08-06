/**
 * @openapi
 * /health:
 *   get:
 *     summary: End-to-end health check (API + MongoDB)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service and database are healthy
 *       503:
 *         description: Database is not connected
 *
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       201: { description: User created }
 *       422: { description: User already exists }
 *
 * /api/auth/user/{id}:
 *   get:
 *     summary: Get a user by numeric id (resolved as USER-{id})
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User found }
 *       404: { description: User not found }
 *
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in }
 *       401: { description: Invalid credentials }
 *       404: { description: User not found }
 *
 * /api/auth/logout:
 *   post:
 *     summary: Log out and blacklist the current token
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Logged out }
 *       400: { description: Token not found }
 *
 * /api/accounts:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Account created }
 *       401: { description: Unauthorized }
 *   get:
 *     summary: List accounts for the authenticated user
 *     tags: [Accounts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Accounts retrieved }
 *       401: { description: Unauthorized }
 *
 * /api/accounts/balance/{accountId}:
 *   get:
 *     summary: Get the balance of an account
 *     tags: [Accounts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Balance retrieved }
 *       401: { description: Unauthorized }
 *       404: { description: Account not found }
 *
 * /api/transactions:
 *   post:
 *     summary: Create a transaction between accounts
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Transaction created }
 *       401: { description: Unauthorized }
 *
 * /api/transactions/system/initial-funds:
 *   post:
 *     summary: Create initial funds for the system account (system user only)
 *     tags: [Transactions]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Initial funds transaction created }
 *       401: { description: Unauthorized }
 */
export { };
