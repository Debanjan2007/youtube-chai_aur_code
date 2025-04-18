import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

// middlewares 
app.use(cors({
    origin : process.env.CORS_ORIGIN ,
    credentials : true,
})
)
app.use(cookieParser())
app.use(express.json({//data comming from json
    limit: '16kb',
}))
app.use(express.urlencoded({//data comming from url 
    extended: true,
    limit: '16kb',
}))
app.use(express.static('public'))//for files mainli images



import { router } from "./routes/user.routes.js"

// routes declaration 
app.use("/api/v1/users" , router) // /users/register , /users/login , /users/logout

export { app } 