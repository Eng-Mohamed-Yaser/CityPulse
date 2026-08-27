import app from "./app.js";
import { connectDB } from "./Config/database.js";
import { env } from "./Config/env.config.js";

const PORT = env.PORT;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();