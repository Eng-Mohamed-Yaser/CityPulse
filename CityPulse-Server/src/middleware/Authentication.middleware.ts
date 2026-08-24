import type { Request, Response, NextFunction } from "express";
import {verifyToken} from "../services/token.services.js";

export function Authentication(req:Request,res:Response,next:NextFunction){
    try{
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({msg:"NO TOKEN PROVIDED"});
    }
    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).json({msg:"ERROR TOKEN"});
    }
    const decoded = verifyToken(token);
    (req as any).user = decoded;
    next();
    }
    catch(error){
        return res.status(401).json({msg:"InVALID TOKEN!"});
    }
}