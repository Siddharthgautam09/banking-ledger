import express from 'express';
import mongoose from 'mongoose';

const healthRouter = express.Router();

healthRouter.get('/', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;

    res.status(dbConnected ? 200 : 503).json({
        status: dbConnected ? 'ok' : 'degraded',
        uptime: process.uptime(),
        db: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
    });
});

export default healthRouter;
