import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({                                                // use() register middleware
    origin: process.env.CORS_ORIGIN,                          // here the backend explicitly allowing frontend origin using CORS middleware
    credentials: true                                         // CORS we frontend and backend have diff localhost ports so to allow frontend to access backend we use this 
}))


// express Middlewares

app.use(express.json({limit:"16kb"}))   // client sends data in json format so we need to parse data in json format and limit is the size of data we can send in req body
app.use(express.urlencoded({extended:true, limit: "16kb"}))   // this is to abhishek + pandey or %20 this kind of in link so to encode that we do this 
app.use(express.static('public'))                            // static files directly from the publicfolder like iamges, css etc we can access direclty from public folder without any routes or controller
app.use(cookieParser())

// import routes

import userRouter from "./routes/user.routes.js";       

//routes declaration

app.use("/api/v1/users", userRouter)            // .use() is used to register middleware

// http://localhost:5000/api/v1/users/register


export default app;