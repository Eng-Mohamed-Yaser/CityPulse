import express from 'express';
import cors from "cors";
import issueGroupsRouter from './routes/issueGroups.routes.js';
import { connectDB } from './config/database.js'
import { notFound } from './middleware/notFound.middleware.js';

const app = express();

app.use(cors({

}))

app.use(express.json());
app.use('/api/issue-groups', issueGroupsRouter);
app.use(notFound)
connectDB();

export default app;