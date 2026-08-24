import type {Request , Response , NextFunction} from 'express';

export function ErrorHandle(err: any,req:Request,res:Response,next:NextFunction){
    console.log("Error Handling is : ",err);
    return res.status(500).json({msg:"Server Error!"});
}

