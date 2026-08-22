import { body , param} from "express-validator";

export const validateRegister = [

   ////////////////////////////// Register///////////////////////////////////


    body("name")
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("NameUser must be between 3 and 10 characters"),


    body("passwordHash")
    .not()
    .isEmpty()
    .trim()
    .isLength({min:10 , max:15})
    .withMessage("Password must be between 10 and 15 characters"),



    body("email")
    .not()
    .isEmpty()
    .trim()
    .isEmail()
    .withMessage("Not Allowed This Email"),


];


    

export const validateLogin = [
    ////////////////////////////// Login ///////////////////////////////////

    
    body("password")
    .not()
    .isEmpty()
    .trim(),


    body("email")
    .not()
    .isEmpty()
    .trim()
    .isEmail(),
];
   


export const validateGetUserById = [

    ////////////////////////////// Param(id) ///////////////////////////////////


     param("id")
    .isMongoId()
    .withMessage("Invalid User ID"),

];




export const validateUpdateUser = [

    ////////////////////////////// Param(id) ///////////////////////////////////

    param("id")
    .isMongoId(),


    body("name")
    .not()
    .isEmpty()
    .trim()
    .isLength({ min: 3, max: 10 }),


    body("email")
    .not()
    .isEmpty()
    .trim()
    .isEmail(),


    body("password")
    .not()
    .isEmpty()
    .trim()
    .isLength({min:10 , max:15}),


];

   

export const validateDeleteUser = [

    param("id")
        .isMongoId()
        .withMessage("Invalid User ID"),

];
