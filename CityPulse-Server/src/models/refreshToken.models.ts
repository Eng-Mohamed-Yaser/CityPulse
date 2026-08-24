import mongoose, { Types} from "mongoose";

const Mongo_R_Token = new  mongoose.Schema({

    R_Token:{
        type:String,
        required:true
    },

    userId:{
        type:Types.ObjectId,
        ref:"Users",
        required:true
    },

    expired:{
        type:Date,
        required:true
    }
})

export const Refresh_Token = mongoose.model("RefreshToken" , Mongo_R_Token)

