import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";

const connectDB = async () => {
    try {
        const connection_instence = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connected !! DB HOST ${connection_instence.connection.host}`)
    } catch (err) {
        console.log("MONGODB connection Failure :" , err )
        process.exit(1)
    }
}

export  {connectDB }