import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({                                                // use() register middlware
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))   // this is to abhishek + pandey or %20 this kind of in link so to encode that we do this 
app.use(express.static('public'))
app.use(cookieParser())

// import routes

import userRouter from "./routes/user.routes.js";

//routes declaration

app.use("/api/v1/users", userRouter)

// http://localhost:5000/api/v1/users/register


export default app;