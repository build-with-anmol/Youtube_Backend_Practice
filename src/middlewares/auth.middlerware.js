// By using this middle verify the user wheather it is logged in or not

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandller.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  // This is the middleware which authenticate the user and check for the user details
 try {
     const token =
       req.cookies?.accessToken ||
       req.header("Authorization")?.replace("Bearer ", "");
   
     if (!token) {
       throw new ApiError(401, "Unauthorized Request !");
     }
   
     const decodedToken = jwt.verify(
       token,
       process.env.ACCESS_TOKEN_SECRET
       // (err, decoded) => {
       //   if (err) {
       //     throw new ApiError(401, "Unauthorized Request !");
       //   }
       //   return decoded;
       // }
     );
   
     const user = await User.findById(decodedToken._id).select(
       "-password  -refreshToken"
     ); // Getting the user details from the db 
   
     if (!user) {
       throw new ApiError(401, "Unauthorized Request !");
     }
   
     req.user = user;
     next();
 } catch (error) {
     throw new ApiError(401, error.message || "Invalid Request !");
    
 }
});
