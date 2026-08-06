import express from "express";
import swaggerUi from "swagger-ui-express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import accountRouter from "./routes/account.routes.js";
import transactionRouter from "./routes/transaction.routes.js";
import healthRouter from "./routes/health.routes.js";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/health', healthRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRouter);

export default app;
