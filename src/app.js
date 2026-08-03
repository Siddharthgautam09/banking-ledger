import express from "express";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import accountRouter from "./routes/account.routes.js";
import transactionRouter from "./routes/transaction.routes.js";


const app = express();

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',authRouter)
app.use('/api/accounts',accountRouter)
app.use('/api/transactions',transactionRouter)



export default app;