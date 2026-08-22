import bcrypt from "bcrypt";

export function HashPassword(password:string){
    const saltResult = 10;
    return bcrypt.hash(password,saltResult);
}

export function ComparePassword(password:string , hashpassword:string){
    return bcrypt.compare(password,hashpassword);
}

