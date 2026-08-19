import mongoose from "mongoose";

const MongoUser = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        maxlength: 10,
        minlength: 2,
    },

    email:{
        type:String,
        required:true,
        trim:true,
        unique: true,
        validate:{
            validator: (emailInput) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput);
      },
      message: "Error in Email patern  > eamail@ gmail.com",
    },
  },


  passwordHash:{
    type: String,
    required: true,
    trim:true,
  },

  role:{
    type: String,
    enum:{
        values:["admin","citizen"],
        message:"Please Enter The role",
    },
    required:true,
    trim:true,
  },

  isActive:{
    type:Boolean,
    default: true,
  },

})

export const UserModel = mongoose.model("Users",MongoUser);
