import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHsndler } from "../utils/asyncHanlder";
import jwt from "jsonwebtoken"

export const verifyJwt =  asyncHsndler( async (req , res , next) => {
    const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    if(!token){
        throw new ApiError(401 , "Unauthorised request");
    }
    const decodedInfo = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodedInfo?._id).select("-password -refreshToken");
    // todo use of the refresh token 
    if(!user){
        throw new ApiError(401 , "invalid access Token")
    }
})