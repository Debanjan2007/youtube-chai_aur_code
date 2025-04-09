// require('dotenv').config({path: './env'})

import dotenv from "dotenv";
import {connectDB} from "./db/index.js";
import { app } from "./app.js";



dotenv.config({path: './env'})

connectDB()
.then(() => {
    app.on('error', (err) => {
        console.log(`Error in Express Server : ${err}`)
        throw err ;
    })
    app.listen(process.env.PORT || 6000, () => {
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch( (err) => {
    console.log(`MongoDB connection Failed !!!:`,err)
})