import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHsndler } from "../utils/asyncHanlder.js";
import jwt from "jsonwebtoken"

const verifyJwt =  asyncHsndler( async (req , _ , next) => {
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace(/^Bearer\s+/i, "").trim()
        
        if(!token || typeof(token) !== "string"){
            throw new ApiError(401 , "Unauthorised request");
        }
        const decodedInfo = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedInfo?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401 , "invalid access Token")
        }
    
        req.user = user ;
        next() ; 
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid access token")
    }
})

export {
    verifyJwt
}