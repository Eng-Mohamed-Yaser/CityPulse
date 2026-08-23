import mongoose , {Types} from "mongoose";

const ReastPassword = new mongoose.Schema({

    token:{
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

});

export const PasswordModel = mongoose.model("PasswordResetToken" ,ReastPassword )

