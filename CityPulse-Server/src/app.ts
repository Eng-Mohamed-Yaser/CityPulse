import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js';
import issueGroupsRouter from './routes/issueGroups.routes.js';
import reportsRouter from "./routes/reports.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

import { notFound } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { env } from "./config/env.config.js";

const app = express();

app.use(
    cors({
        origin: 'http://localhost:' + env.PORT,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/issue-groups', issueGroupsRouter);
app.use("/api/dashboard", dashboardRouter);

app.use(notFound)
app.use(errorHandler)

export default app;