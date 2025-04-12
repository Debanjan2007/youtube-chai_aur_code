// require('dotenv').config({path: './env'})

import dotenv from "dotenv";
import {connectDB} from "./db/index.js";
import { app } from "./app.js";
const port = process.env.PORT || 6000 ;


dotenv.config({path: './env'})

// CORS = Cross Origin Reource Sharing
connectDB()//returns promise so the .then & .catch is needed 
.then(() => {
    app.on('error', (err) => {
        console.log(`Error in Express Server : ${err}`)
        throw err ;
    })
    app.listen(port, () => {
        console.log(`Server is running on port : ${port}`)
    })
})
.catch( (err) => {
    console.log(`MongoDB connection Failed !!!:`,err)
})