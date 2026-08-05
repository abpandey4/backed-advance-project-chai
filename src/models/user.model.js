import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"            
import bcrypt from "bcrypt"              // this is used to hash the password....(to ecrypt)

const userSchema = new Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true, 
            lowerCase: true,
            trim: true,
            index: true      // if searching field wants to enable the index true
        },
        email:{
            type: String,
            required: true,
            unique: true, 
            lowerCase: true,
            trim: true,
        },
        fullname:{
            type: String,
            required: true,
            trim: true,
            index: true      // if searching field wants to enable the index true
        },
        avatar:{
            type: String,   // cloudinary url
            required: true,     
        },
        coverImage:{
            type: String
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken:{
            type: String
        },
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function(next){        // to encrypt before saving we use this pre hook from (mongoose middleware)
    if(!this.isModified("password")) return next()  // ismodified is built-in methods
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
})  


userSchema.methods.isPasswordCorrect = async function(password){        //created methods to inject in schema
    return await bcrypt.compare(password, this.password)
}  

userSchema.methods.generateAccessToken = async function(){             //created methods to inject in schema for access token its a jwt token
   return jwt.sign(                                                          // sign() generate the token
        {
          _id: this._id,
          email:this.email,
          username: this.username,
          fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )                                                        
}     

userSchema.methods.generateRefreshToken = async function(){
     return jwt.sign(                                                          // sign() generate the token
        {
          _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )  
}
export const User = mongoose.model("User", userSchema)