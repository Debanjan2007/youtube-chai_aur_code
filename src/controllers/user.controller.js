import { asyncHsndler } from '../utils/asyncHanlder.js' ;
import {ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.service.js"
import { ApiResponse } from "../utils/apiResponse.js"
import fs from 'fs' ;
import  jwt  from 'jsonwebtoken';
import {stringify} from "flatted" ; 
 // won't crash, but might still be messy


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId) ;
        const accessToken = await user.generateAccessToken() ;
        const refreshToken = await user.generateRefreshToken() ;

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
    
    let coverImageLocalPath = 0;
    let avatarLocalPath = 0;
    if(req.files.avatar !== null){
        avatarLocalPath =  req.files.avatar[0].path;
    }
    if(req.files.coverImage !== null){
        coverImageLocalPath = req.files.coverImage[0].path ;
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
    
    const {email, password} = req.body ;
    
    if (!email) {
        throw new ApiError(400 , "User Name or email needed") ; 
    }

    const user = await User.findOne({email}) 

    if(!user){
        throw new ApiError(404 , "User does not exist") ;
    }
    const isPasswordvalid = await user.isPasswordCorrect(password) ;

    if(!isPasswordvalid){
        throw new ApiError(401 , "Invalid user credentials!") ;
    }
    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id) ; 

    // user.refreshToken = refreshToken ;
    // user.select("-password -refreshToken")
    const logedinUser = await User.findById(user._id).select(
        "-password -refreshToken -accessToken"
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
    await User.findByIdAndUpdate(
        req.user._id , 
        {
            $set: {
                refreshToken : undefined ,
            }
        }
);
    const options = {
        httpOnly: true ,
        secure: true 
    }  

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new ApiResponse(200 ,  "User logedout successfully"))
})

// refresh access token 
const refreshAccessToken = asyncHsndler(async (req , res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken ;
    if(!incomingRefreshToken) {
        throw new ApiError(401 , "Unauthorized request");
    }

try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET) ;
        const user = await User.findById(decodedToken?._id) ;
    
        if(!user) {
            throw new ApiError(401 , "refreshToken Invalid");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401 , "refreshToken is expired or used");
        }
    
        const {accessToken , newrefreshToken} = await generateAccessAndRefreshTokens(user._id) ;
    
        const options = {
            httpOnly : true ,
            secure: true
        }
    
    
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newrefreshToken , options)
        .json(
            new ApiResponse(
                200 , {
                     accessToken , newrefreshToken 
                } ,
                    "Acces token refreshed" 
            )
        )
} catch (error) {
    throw new ApiError(401 , error?.message || "invalid refreshtoken")
}

})

// password change 
const changeCurrentPassword = asyncHsndler( async (req , res) => {
    console.log(req.body);
    
    const {oldPassword , newPassword} = req.body ;

    const user = await User.findById(req.user?._id) ;

    const ispasswordcorrect = await user.isPasswordCorrect(oldPassword) ;
    if(!ispasswordcorrect){
        throw new ApiError(400, "Invalid password");
    }
    user.password = newPassword ; //set 
    await user.save({validateBeforeSave: false}) ; // save

    return res.status(200)
    .json(new ApiResponse(200 , {} , "Password changed successfully")) ;
})

const getCurrentUser = asyncHsndler( async (req , res) => {
    const user = await User.findById(req.user?._id).select(
        "-password -refreshToken"
    ) ;
    return res
    .status(200)
    .json(200 , user , "User fetched successfully") ;
})

const updateAccountdetails = asyncHsndler( async (req , res) => {
    const {fullName , email} = req.body ; 
    if(!fullName || !email){
        throw new ApiError(400 , "All fields are required");
    }
    const existedUser = await User.findById(req.user._id) ;

    existedUser.email = email ;
    existedUser.fullName = fullName ;

    await existedUser.save({validateBeforeSave: false}) ;   
    // console.log(stringify(mongoClient));
    const user = await User.findById(existedUser._id).select(
        "-password -refreshToken"
    )
    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , user , "User details updated successfully"
        )            
        
    )

})

const updateImage = asyncHsndler( async (req , res) => {
    // take avatar local path from the req.files 
    // upload on cloudinary & return the url 
    // make a database query to update user avatar 
    const avatarLocalPath = req.files?.avatar[0].path || "";  
    const coverImageLocalPath =  req.files?.coverImage[0].path || "" ;


    if(avatarLocalPath === "" && coverImageLocalPath === "" ){
        throw new ApiError(400 , "Avatar file is required") ;
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath) || "";
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) || "" ;
    if(avatar){
        fs.unlink(avatarLocalPath) ;
    }else if(coverImage){
        fs.unlink(coverImageLocalPath)
    }else{
        fs.unlink(coverImageLocalPath) ;
        fs.unlink(avatarLocalPath) ;
    }

    if(!avatar || !coverImage){
        throw new ApiError(501 , "server can't save the avatar now!")
    }
    const user = User.findByIdAndUpdate(req.user._id ,
        {
            $set: {
                avatar , 
                coverImage
            }
        },
        {
            new: true
        }
    ).select("-password  -refreshToken")
    return res
    .status(200)
    .json(
        new ApiResponse(200 , user , "User Avatar created successfully")
    )
})
export { 
    registerUser ,
    loginUser ,
    logeoutUser ,
    refreshAccessToken , 
    changeCurrentPassword , 
    getCurrentUser , 
    updateAccountdetails , 
    updateImage
}