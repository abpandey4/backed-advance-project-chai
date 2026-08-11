// Designing our own  middleware which will verify that is there user or not 
// which we r using for logout user 

import { User } from "../models/user.model";
import apiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req, res, next)=>{      // next means ...dekho apna kaam hogaya hai khatam abb kaha pe isko leke jaana hai leke jaao response pe yaa agle middleware pe jaha bhi jaana hai jaao
      try {
        const token = req.cookies?.accessToken || req.header          // header is a method which is avaible built in can check in postman headers section ....now here we get token from cookies or header auth se token nikale                               
         ("Authorization")?.replace("Bearer ", "")                    // if we get bearer "(and space) then replace it with empty string, then here we get the token  
  
         if (!token) {
          throw new apiError(401, "Unauthorized user")
         }
  
         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
         const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
         if(!user){
          throw new apiError(401, "Invalid Access Token")
         }
  
         req.user = user;
         next()
      } catch (error) {
        throw new apiError(401, error?.message || "Invalid Access Token")
      }
})