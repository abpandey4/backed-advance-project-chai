import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
    
   // steps to register user

    // get User data from frontend(here we are going to take from postman)
    // validation of data - not empty
    // check if user already exists - username, email
    // check for images check for avatar (local storage)
    // upload them (img and avatar) to cloudinary avatar
    // create user object - create entry in DB
    // remove password and refreshtoken field from response
    // check for user creation 
    // return response(res)

    const {username, fullname, email, password} = req.body;        //get user data from frontend
    console.log("Email:", email)

    if(fullname === ""){                                        // validation 
        throw new apiError(400, "Fullname is required")
    }
    if(email === ""){
        throw new apiError(400, "Email is required")
    }
    if(username === ""){
        throw new apiError(400, "Username is required")
    }
    if(password === ""){
        throw new apiError(400, "Password is required")
    }

    const existedUser = User.findOne({                     // check if user already exists
        $or: [{ username },{ email }]
    })

    if(exitedUser){
        throw new apiError(409, "User with Email or Username already Exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path             // check for coverImage and avatar in local storage   
    const coverImageLocalPath = req.files?.coverImage[0]?.path      // [0] means first file uplaoded in array of files 
                                                                    // ?. if files exists access avatar and if avatar[0] exists return its path
                                                                    
    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is Required")
    }   
    // not doing for coverImage because we r keeping it optional

    const avatar = await uploadOnCloudinary(avatarLocalPath)             // upload avatars and coverImage (files) on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar is require Field")
    }

    const user = await User.create({                              // create user object
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" ,     // here we have not compulsion for coverimage so we r checking if coverImage is there then give url else return empty
        email,
        password,
        username: username.toLowerCase()

    })
      
    // remove password and refreshtoken field from response 
                                                                     // user creation checked using findByID()
    const createdUser = await User.findById(user._id).select(       // select() means defaultly selected everyfield.....but -password(-minus) means not required
       " -password -refreshToken "  
    )                                                               // if user is not there then error
    if(!createdUser){                                               // this error is from server side soo 500 status code
        throw new apiError(500, "Something went wrong while registering the user");  
    }

    // return response(res)

    return res.status(201).json(
        new apiResponse(200, createdUser, "User Registered successfully")                                        // created new object of apiResponse
    )

})

export default registerUser;