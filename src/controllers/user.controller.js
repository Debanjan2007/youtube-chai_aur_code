import { asyncHsndler } from '../utils/asyncHanlder.js' ;
import {ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.service.js"
import { ApiResponse } from "../utils/apiResponse.js"
import fs from 'fs' ;

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId) ;
        const accessToken = user.generateAccessToken() ;
        const refreshToken = user.generateRefreshToken() ;

        user.refreshToken = refreshToken ; 
        await user.save({validateBeforeSave : false}) ; 

        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500 , "Something went wrong while creating tokens")
    }
}


const registerUser = asyncHsndler(async (req , res) => {
   


   const {userName , fullName , email , password} = req.body ;

    //  for production based job do this things out of this file at somewhere else and call it here 
    // validation
    if(
        [fullName , email , userName , password].some((field) => 
        field?.trim() === "" 
        )
    ){
        throw new ApiError(400 , "All fields are compolsory");
    }

    // if user exists 
    const existedUser = await User.findOne({ // User object is returned from the mongoose schema 
        $or : [{ email } , { userName }]
    })

    if(existedUser){
        console.log(existedUser);
        throw new ApiError(409 , "User already exists")
    }
    

    // TypeError: Cannot read properties of undefined (reading '0') these types of error sometime occurs due to the use of the "?" marks
    
    const coverImageLocalPath = 0;
    const avatarLocalPath = 0 ;
    if(req.files && !req.files.coverImage === null){
        coverImageLocalPath = await req.files.coverImage[0].path ;
    }
    if(req.files && !req.files.avatar === null){
        avatarLocalPath = await req.files.avatar[0].path ;
    }
    

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required") ;
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath) ;
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) ;
    

    if(!avatar){
        console.log("can't get avatar so sending error!!")
        throw new ApiError(400 , "Avatar file is required") ;
    }

    const user = await User.create({ //User got from schema 
        fullName ,
        avatar: avatar,
        coverImage: coverImage || "" ,
        email,
        password,
        userName: userName.trim().toLowerCase()
    })
    const createduserName = await User.findById(user._id).select(
        "-password -refreshToken"
    ) ; 
    if(!createduserName) {
        fs.unlinkSync(avatarLocalPath) ;
        fs.unlinkSync(coverImageLocalPath) ;
         throw  new ApiError(501 , "Something went while creating user!") ;
    }
    return res.status(201).json(
        new ApiResponse(200 , createduserName , "User created successfully")
    )
})


// user login 
// req body -> data 
// email & password
// find the user 
// check password 
// access & refresh token send to the user 
// send cookies 

const loginUser = asyncHsndler( async (req , res) => {
    const {email , userName , password} = req.body ;
    
    if (!userName || !email) {
        throw new ApiError(400 , "User Name or email needed") ; 
    }

    const user = await User.findOne({
        $or : [{userName} , {email}]
    }) 

    if(!user){
        throw new ApiError(404 , "User does not exist") ;
    }
    const isPasswordvalid = await user.isPasswordCorrect(password) ;

    if(!isPasswordvalid){
        throw new ApiError(401 , "Invalid user credentials!") ;
    }
    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id) ; 

    // user.refreshToken = refreshToken ;
    // user.select(
    //     "-password -refreshToken"
    // )
    const logedinUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ); 

    // sending cookies 

    const options = {
        httpOnly: true ,
        secure: true 
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new ApiResponse(
            200 , {
                user : logedinUser , accessToken , refreshToken 
            } ,
                "User loged in successfully" 
        )
    )
})

// logedout 
const logeoutUser = asyncHsndler( async(req , res) => {
    
})

export { 
    registerUser ,
    loginUser        
}