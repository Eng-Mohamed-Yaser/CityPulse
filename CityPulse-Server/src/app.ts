import express from 'express';
import cors from "cors";
import issueGroupsRouter from './routes/issueGroups.routes.js';
import reportsRouter from "./routes/reports.routes.js";
import { notFound } from './middleware/notFound.middleware.js';
import {errorHandler} from './middleware/errorHandler.middleware.js';

const app = express();

app.use(cors({

}))

app.use(express.json());
app.use('/api/reports',reportsRouter)
app.use('/api/issue-groups', issueGroupsRouter);
app.use(notFound)
app.use(errorHandler)

export default app;