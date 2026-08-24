import express from "express";
import { RouterUser } from "./routes/user.route.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.config.js";
import {router} from "./routes/issueGroups.routes.js";
import {BoardRouter} from "./routes/dashboard.route.js";
import {ReportRouter} from "./routes/reports.routes.js";
import { notFound } from './middleware/notFound.middleware.js';
import {errorHandler} from './middleware/errorHandler.middleware.js';
import cors from "cors";

const app = express();
const Port = env.PORT;

app.use(cors())


app.use(express.json());

app.use("/users", RouterUser);  ////////////////////// User //////////////////////////////

app.use("/issue" , router);     ////////////////////// Issue //////////////////////////////

app.use("/report" , ReportRouter); ////////////////////// Report //////////////////////////////

app.use("/board" ,BoardRouter );   ////////////////////// Dashboard //////////////////////////////


app.use(notFound)
app.use(errorHandler)

async function startServer() {
  try{
    await connectDB();

    app.listen(Port, () => {
    console.log(`Server running on http://localhost/${Port}`);
  });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();