import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const genrateAccessandRefreshToken = async(userId)=>{        // creating method for generation of access and ref token for login user
    try {
       const user =  await User.findById(userId)
       const accessToken = user.generateAccessToken()       // we give access token to user
       const refreshToken = user.generateRefreshToken()     // refresh token we also keep in DB soo that user to need to write password everytime after the session timeout
       
       user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})                                          // .save() user getting saved  & validateBeforeSave is mongoose fn means valdiation mat lagao direct save kardo

       return{accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500, "something went wrong while generating access and refresh token")
    }
}

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
    console.log("Email:", email)                                   // just to test we consoled this 

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


    /* OR we can also write in one line code (this work is done in 1 line in chai-code tutorial but to understand better we did in this way )*/
/*
            if(
                [fullname, email, password, username].some(field => !field?.trim())
            ){
                throw new apiError(400, "all feilds are required")
            }
*/

    const existedUser = await User.findOne({                     // check if user already exists
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new apiError(409, "User with Email or Username already Exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path             // check for coverImage and avatar in local storage   
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path      // [0] means first file uplaoded in array of files 
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
        new apiResponse(200, createdUser, "User Registered successfully")                      // created new object of apiResponse
    )
})

const loginUser = asyncHandler(async(req,res)=>{

    // steps to loginUser

    // get user data from req.body
    // username or email
    // find the user
    // password check
    // access token & refreshtoken generation
    // send refresh token and access token in cookies(which is send cookies)

    const {email, username, password} = req.body    // getting user data from frontend or req.body
    console.log("email")

    if(!username && !email){                       // here we'r doing with both  email and username ...if we want to do with any of one then remove the remaining one like username or email 
        throw new apiError(400, "Username or Email is required")
    }

    // Here is an alternative of above code based on logic discussed 
    // if(!username || !email){  
    //    throw new apiError(400, "Username or Email is required")
    // }
    


    const user = await User.findOne({                      // finding user from username or email ...on the base of anyone a data/user should get 
        $or: [{username},{email}]                          // $or means yaa to username k base pe mil jaaye yaa phir email k base pe mil jaaye 
    })                                                     // $or and etc are mongodb operators

    if(!user){
        throw new apiError(404, "User does'nt exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)       // password check

    if(!isPasswordValid){
        throw new apiError(401, "Invalid User Credentials")
    }

    const {accessToken, refreshToken} = await genrateAccessandRefreshToken(user._id)   // generating refresh and access token 

    const loggedInUser = await User.findById(user._id).select      // optional step ...if want to use ..otherwise let it be 
    ("-password -refreshToken")
    

    const options ={                // otherwise by default even frontend can also modify the cookies        
        httpOnly: true,             // by using this code the cookies are modified by only servers so frontend guys cant modified      
        secure: true              
    }

    return res                              // res send and also cookie
    .status(200)                                     
    .cookie("accessToken", accessToken, options)        // set access token and refresh token here 
    .cookie("refreshToken", refreshToken, options)
    .json(                                              // sending json response here 
        new apiResponse(200,
            {
              user: loggedInUser, refreshToken, accessToken    //here we tooked tokens again beacuse if the user want to store 
                                                              //that token in local storage or somewhere else so we again wrote tokens here
            },                                                // and also remember this user field is data check in apiResponse.js
            "User Logged In Successfully"
           
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{           // to logout we need to use middlewares....jaane se phele mil k jaana  // will design our own middleware 
   await User.findByIdAndUpdate(req.user._id ,               // it will find user by id and update the with given object
        {
            $set: {                                        // $set does that what we have to update give me in object  and it will update 
                refreshToken : undefined
            }  
        },
        {
            new: true
        }
    
    )

    const options ={               
        httpOnly: true,                        // for cookies as written in loginUser as well      
        secure: true              
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)                             // clearcookie method available hota hai phele se becuase we have added cookieParser()
    .clearCookie("refreshToken",options)
    .json(new apiResponse(200, {}, "User LoggedOut"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{                     // getting new refreshed token 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken  // added refreshaccesstoken endpoint

    if (!incomingRefreshToken){
       throw new apiError(401, "Unauthorized User") 
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apiError("401", "Inavlid Refresh Token"); 
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new apiError(401,"Refresh token is expired or used");   
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await genrateAccessandRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new apiResponse(200,
            {accessToken, refreshToken : newRefreshToken},
            "Access token refreshed Successfully"
        ))
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh Token" )
    }

})
   
const changeCurrentPassword = asyncHandler(async(req,res)=>{               // just need to change the current password from user 
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid OldPassword")
    }

    user.password = newPassword
    user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password change Successfully"))
})                

const getCurrentUser = asyncHandler(async(req,res)=>{                       // getting current user 
    return res
    .status(200)
    .json(new apiResponse(200), req.user, "Current User fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{                 // update Account details of user
    const {fullname, email} = req.body

    if (!fullname || !email) {
        throw new apiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200), user, "Accout Details Updated Successfully")
})

const updateUserAvatar = asyncHandler(async(req,res)=>{                         // updating files ...here we will use multer midware
    const avatarLocalPath = req.file?.path                                      // req.file/files comes from the multer

    if(!avatarLocalPath){                                                       // agar avatar local file mein nhi hai toh throw error
        throw new apiError(400 , "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)                    // here avatar is uploaded

    if(!avatar.url){
        throw new apiError(400, "Error while uploading on Avatar")
    }

    const user = await User.findByIdAndUpdate(                                                 // from here avatar(files) is updated
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar Updated Successfully"))
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{                        // updating coverImage(file)
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new apiError(400, "CoverImage file is missing")                      // same as avatar
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new apiError(400, "Error while Upload on CoverImage")
    }

    const user = await User.findByIdAndDelete(
        req.user?._id,
        {
            $set : {
                coverImage : coverImage.url
            }
        },
        {new: true}
    ).select("-password")
    
    return res
    .status(200)
    .json(new apiResponse(200), user, "CoverImage Updated Successfully")
})


export{
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};