import dns from "node:dns";
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({
    path: './.env'
})
connectDB();


























// first way to connect DB ...but not using this method because we have coonected using 
//second method in DB file separte file 
/*
import express from "express"

const app = express()
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/
