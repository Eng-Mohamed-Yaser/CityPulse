import {Router} from "express";
import {getUsers 
    ,getUsersById 
    , UpdatedUser 
    ,DeletedUser
    , Register 
    , Login 
    , Logout
    ,ForgotPassword
    ,ResetPassword} from "../controller/Users.controller.js";

import {Authentication} from "../middleware/Authentication.middleware.js";

import {AuthorizationAdmin} from "../middleware/Authorization.middle.js";

import {validate} from "../middleware/validate.middleware.js";

import {validateRegister 
    , validateLogin 
    , validateGetUserById 
    , validateUpdateUser 
    , validateDeleteUser} from "../validators/user.validator.js";



export const RouterUser = Router();

/////////////////////// Register Route //////////////////////////////////////
RouterUser.post("/register" , validateRegister , validate , Register);

/////////////////////// Login Route //////////////////////////////////////
RouterUser.post("/login",validateLogin , validate , Login);

////////////////////// Logout Route /////////////////////////////////////
RouterUser.post("/logout" , Logout);

//////////////////////  Get Route ////////////////////////////////////
RouterUser.get("/", getUsers);
RouterUser.get("/:id",validateGetUserById , validate , Authentication, getUsersById);



//////////////////////  Put Route ////////////////////////////////////
RouterUser.put("/:id", validateUpdateUser , validate , Authentication, AuthorizationAdmin, UpdatedUser);


//////////////////////  Delete Route ////////////////////////////////////
RouterUser.delete("/:id", validateDeleteUser , validate , Authentication ,AuthorizationAdmin, DeletedUser);



///////////////////////// Forget Password ////////////////////////////////
RouterUser.post("/forgot-password", ForgotPassword);



///////////////////////// Reset Password ////////////////////////////////
RouterUser.post("/reset-password", ResetPassword);






// {
//   "name": "Maryam",
//   "email": "maryam@test.com",
//   "passwordHash": "12345678",
//   "role": "citizen",
//   "isActive": true
// }
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOGIyMWE3ZjU0NzlhYThlNDhmNjI1YSIsImVtYWlsIjoibWFyeWFtQHRlc3QuY29tIiwicm9sZSI6ImNpdGl6ZW4iLCJpYXQiOjE3ODc1MDMwNDgsImV4cCI6MTc4NzUwNjY0OH0.JBg7P6nTPPYIXJu9-_0h9ImpMOPwR6UYc6zx1MEXpec

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1hcnlhbUB0ZXN0LmNvbSIsImlhdCI6MTc4NzUwMzA0OCwiZXhwIjoxNzg3NTM5MDQ4fQ.F45WzTUmTZrfg9ys0b80PGoXN8LYxDhhxnsO-a0GGyg

