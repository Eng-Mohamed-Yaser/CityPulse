import {UserModel} from "../models/user.models.js";
import {HashPassword , ComparePassword} from "../services/infoPass.services.js";
import {generatetoken ,generateRefreshToken , generateResetPasswordToken} from "../services/token.services.js";
import type { Request, Response} from "express";
import {Refresh_Token} from "../models/refreshToken.models.js";
import {PasswordModel} from "../models/passwordResetToken.models.js";

////////// GET /////////////////////////////////////////////////
export const getUsers = async(req:Request,res:Response)=>{
    try{
   const FindUser = await UserModel.find({});
   console.log(FindUser);
   return res.status(200).json({ 
    msg: "Users fetched successfully",
    data: FindUser})
    }
    catch(err){
        console.log("Error is : " , err);
        return res.status(500).json({msg:"ERROR SERVER!"});
    }
}

//////////// GetById  /////////////////////////////

export const getUsersById = async(req:Request,res:Response)=>{
    try{
   const FindUserById = await UserModel.findById(req.params.id);
   console.log(FindUserById);
   if (!FindUserById) {
    return res.status(404).json({
        msg: "User not found"
    });
}
   return res.status(200).json({ 
    msg: "User fetched successfully",
    data: FindUserById})
    }
    catch(err){
        console.log("Error is : " , err);
        return res.status(500).json({msg:"ERROR SERVER!"});
    }
}



/////////  UPdate User  //////////////////////////

export const UpdatedUser = async(req:Request , res:Response)=>{
    try{
    const UpdateUser = await UserModel.findByIdAndUpdate(req.params.id , req.body , {
        new:true,
        runValidators: true
    })
    if(!UpdateUser){
        return res.status(404).json({
        msg: "User not found"
    });
    }
    
    return res.status(200).json({msg:"Updated is Successfully" ,data: UpdateUser});
    }

    catch(err){
        return res.status(500).json({msg:"SERVER Error in UPDATED"});
                }
}




/////////  Delete User  //////////////////////////

export const DeletedUser = async(req:Request , res:Response)=>{
    try{
    const DeleteUser = await UserModel.findByIdAndDelete(req.params.id);

    if(!DeleteUser){
        return res.status(404).json({
        msg: "User not found"
    });
    }
    
    return res.status(200).json({msg: "User deleted successfully" ,data: DeleteUser});
    }

    catch(err){
        return res.status(500).json({msg:"SERVER Error in DELETE"});
                }
}



//////////////  Register ////////////////////

export const Register = async(req:Request , res:Response)=>{
    try{
    const {name , email , passwordHash, role , isActive } = req.body;
    const passwordUserHash = await HashPassword(passwordHash);
    const NewUser = {
            name,
            email,
            passwordHash: passwordUserHash,
            role,
            isActive
        };

        await UserModel.create(NewUser);

    return res.status(201).json({msg:"ADD User Successfully"});
    }
    catch(err){
        return res.status(500).json({msg:"SERVER ERROR IN Register!"});
    }
    
}




//////////////////  Login ///////////////////////////

export const Login = async(req:Request , res:Response)=>{
    try{
    const {email ,password } = req.body;
    if(!email || !password){
        return res.status(401).json({msg:"Pleast Enter Your Password and Email"});
    }

    
    const LoginUser = await UserModel.findOne({email});
    if(!LoginUser){
        return res.status(400).json({ msg: "INVALID EMAIL OR PASSWORD" });
    }

    const ValidPassword = await ComparePassword(password ,LoginUser.passwordHash );
    if (!ValidPassword) {
            return res.status(400).json({ msg: "INVALID EMAIL OR PASSWORD" });
          }

          const token = generatetoken({id: LoginUser._id, email: LoginUser.email, role: LoginUser.role });
          const refresh_Token = generateRefreshToken({email:LoginUser.email});
          const createRefreshToken = await Refresh_Token.create({
            R_Token: refresh_Token,
            userId: LoginUser._id,
            expired: new Date(Date.now() + 10 * 60 * 60 * 1000) });

          res.status(200).json({ msg: "U LOGGED SUCESSFULLY", token: token , refresh_Token : refresh_Token});

    }

    catch(err){
        console.log(err);
        return res.status(500).json({msg:"SERVER ERROR IN LOGIN!"})
    }
}







///////////////////////// Logout /////////////////////////////////////////////////////


export const Logout = async(req:Request , res:Response)=>{
    try{
        const r_token = req.body.refresh_Token;
        if(!r_token){
            return res.status(400).json({msg:"NOT FOUND REFRESH TOKEN"});
        }
        const LogoutUser = await Refresh_Token.findOneAndDelete({R_Token: r_token});
    if(!LogoutUser){
        return res.status(404).json({ msg: "INVALID REFRESH TOKEN OR ALREADY DELETEED" });
    }
    return res.status(200).json({msg:"SUCESSFULLY LOGOUT USER"})
    }
    catch(err){
        console.log(`Server Error ${err}`);
        res.status(500).json({msg : `SERVER ERROR IN LOGOUT! ${err}`});
    }
}





////////////////////////////  ForgetPassword /////////////////////////////////////////


export const ForgotPassword = async (req:Request, res:Response)=>{
    try{
        const email = req.body.email;
        if(!email){
            return res.status(400).json({msg:"NOT FOUND THE EMAIL USER!"});
        }
        const emailUser = await UserModel.findOne({email});
        if(!emailUser){
        return res.status(404).json({ msg: "INVALID EMAIL" });
    }
    const resetToken = generateResetPasswordToken({
    userId: emailUser._id
});
    const R_Password = await PasswordModel.create({token: resetToken,
            userId: emailUser._id,
            expired: new Date(Date.now() + 15 * 60 * 1000)});

            return res.status(201).json({msg: "PASSWORD RESET TOKEN CREATED SUCCESSFULLY!" , resetToken: resetToken});
    }
    catch(err){
        console.log(`Server Error ${err}`);
        return res .status(500).json({msg : `SERVER ERROR TO FORGETPASSWORD! ${err}`});
    }
}






////////////////////////////  ResetPassword /////////////////////////////////////////


export const ResetPassword = async (req:Request, res:Response)=>{
    try{
        const { resetToken, newPassword } = req.body;

        if(!resetToken){
            return res.status(400).json({msg:"NOT FOUND THE ResetToken!"});
        }
        if(!newPassword){
            return res.status(400).json({msg:"NOT FOUND THE NewPassword!"});
        }
        const resetPasswordToken = await PasswordModel.findOne({token: resetToken});

        if (!resetPasswordToken) {
            return res.status(404).json({msg: "INVALID OR EXPIRED RESET TOKEN"});
        }
        if((resetPasswordToken.expired.getTime()) < ((Date.now()))){
            return res.status(400).json({msg:"THE TOKEN IS EXPIRED!"});
        }
        const HashPass = await HashPassword(newPassword);
        const FindUserById  = await UserModel.findById(resetPasswordToken.userId);
        if(!FindUserById){
             return res.status(400).json({msg:"NOT FOUND USER!"});
        }

        FindUserById.passwordHash = HashPass;
        await FindUserById.save();

        await PasswordModel.findByIdAndDelete(resetPasswordToken._id);

        return res.status(200).json({msg:"PASSWORD RESET SUCCESSFULLY!"})

    }
    catch(err){
        console.log(`Server Error ${err}`);
        return res .status(500).json({msg : `SERVER ERROR TO FORGETPASSWORD! ${err}`});
    }
}





// {
//   "name": "Nada",
//   "email": "Nada@test.com",
//   "passwordHash": "1234567890",
//   "role": "admin",
//   "isActive": true
// }




// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOGExNzg5YWNlNjlmNTQ3MDI5YTkxZiIsImVtYWlsIjoiTmFkYUB0ZXN0LmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc4NzQzNTAyOSwiZXhwIjoxNzg3NDM4NjI5fQ.OIloYHeJzlwR7cshJ082VTdMSEKg1BpsyRCQBDzrOgs