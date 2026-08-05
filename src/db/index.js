import mongoose from "mongoose";
import {DB_NAME} from "..//constants.js";

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB CONNECTED !! DB HOST: ${connectionInstance.connection.host}`);           // .connection gives the current/active  MONGODB connection object
                                                                                                        // .host tells which MONGODB server we r connected , hostname of the MongoDb server u r connected: (host/port/name => atlas/27017/videotube resp.)

    } catch (error) {
        console.log("MONGODB connection error", error);
        process.exit(1)  
    }
}

export default connectDB



