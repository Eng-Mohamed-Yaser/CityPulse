import {UserModel} from "../models/user.models.js";
import {HashPassword , ComparePassword} from "../services/infoPass.services.js";
import {generatetoken } from "../services/token.services.js";
import type { Request, Response} from "express";


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

          res.status(200).json({ msg: "U LOGGED SUCESSFULLY", token: token });

    }

    catch(err){
        console.log(err);
        return res.status(500).json({msg:"SERVER ERROR IN LOGIN!"})
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