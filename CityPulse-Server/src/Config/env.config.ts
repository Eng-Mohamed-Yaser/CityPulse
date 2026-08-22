import dotenv from "dotenv";

dotenv.config();

export const env = {
    mongoUri: process.env.MONGO_URI ?? "",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
    jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRES_IN ?? "15",
    jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
    PORT: Number(process.env.PORT)
}
