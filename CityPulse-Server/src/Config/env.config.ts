import dotenv from "dotenv";

dotenv.config();

export const env={
    mongoUri: process.env.MONGO_URI||"",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET||"",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET||"",
}

