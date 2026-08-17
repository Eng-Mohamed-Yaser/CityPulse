import mongoose from "mongoose";
import {env} from "./env.config.js";

export const connectDB = async()=>{
    try{
    await mongoose.connect(env.mongoUri);
    }
    catch(error){
        console.log(`The Error in Database is ${error}`);
        
    }
}

