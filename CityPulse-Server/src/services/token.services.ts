import jwt from "jsonwebtoken";
import {env} from "../config/env.config.js";

export function generatetoken(payload:string |object){
    return jwt.sign(payload,env.Secret_Key,{expiresIn:"1h"})
}
export function generateRefreshToken(payload:string | object){
    return jwt.sign(payload , env.jwtRefreshSecret,{expiresIn:"10h"})
}


export function verifyToken(token:string){
    return jwt.verify(token,env.Secret_Key);
}

export function generateResetPasswordToken(payload: string | object) {
    return jwt.sign(payload, env.jwtRESETPASSWORD, { expiresIn: "15m" });
}
