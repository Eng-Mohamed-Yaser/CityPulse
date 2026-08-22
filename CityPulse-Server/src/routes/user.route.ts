import {Router} from "express";
import {getUsers ,getUsersById , UpdatedUser ,DeletedUser , Register , Login} from "../controller/Users.controller.js";
import {Authentication} from "../middleware/Authentication.middleware.js";
import {AuthorizationAdmin} from "../middleware/Authorization.middle.js";
import {validate} from "../middleware/validate.middleware.js";
import {validateRegister , validateLogin , validateGetUserById , validateUpdateUser , validateDeleteUser} from "../validators/user.validator.js";



export const RouterUser = Router();

RouterUser.post("/register" , validateRegister , validate , Register);
RouterUser.post("/login",validateLogin , validate , Login);

RouterUser.get("/", getUsers);
RouterUser.get("/:id",validateGetUserById , validate , Authentication, getUsersById);


RouterUser.put("/:id", validateUpdateUser , validate , Authentication, AuthorizationAdmin, UpdatedUser);

RouterUser.delete("/:id", validateDeleteUser , validate , Authentication ,AuthorizationAdmin, DeletedUser);


