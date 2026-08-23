import dotenv from "dotenv";

dotenv.config();

export const env={
    mongoUri: process.env.MONGO_URI??"",
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET??"",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET??"",
    PORT:Number(process.env.PORT),
    Secret_Key:process.env.SECRET_KEY??"",
    jwtRESETPASSWORD:process.env.JWT_RESET_PASSWORD_SECRET??""
}
