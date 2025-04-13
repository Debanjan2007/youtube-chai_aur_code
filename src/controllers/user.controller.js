import { asyncHsndler } from '../utils/asyncHanlder.js' ;
import {ApiError} from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.service.js"
import { ApiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHsndler(async (req , res) => {
    // registration of user
    // my mind set 
    // 1 :) user fills the form and send a post request to the server 
    // 2 :) server responds and cecks at the databaase if the user already exists if not then carry forword  if yes then send a response that "already user exists with this email"
    // 3 :) then mongoDB add a user with the help of userSchema and a response is sent to the user as "user created successful"
    // 4 :) if any error occurs in between these operations then it should resolved with try catch  

    // production base mindset
    // 1 :) get user details from frontend  (according to schema) 
    // 2 :) validation - not empty or any other issue from the front end part 
    // 3 :) Check if user already exists : usernaem , email 
    // 4 :) Check for images , also for avatar 
    // 5 :) upload them to cloudinary , avatar 
    // 6 :) Create user object - create entry in db
    // 7 :) remove password and refresh token field from response
    // 8 :) check for user creation 
    // 9 :) return response or sent error 

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
    const existedUser = User.findOne({ // User object is returned from the mongoose schema 
        $or : [{ email } , { userName }]
    })

    if(existedUser){
        console.log(existedUser);
        throw new ApiError(409 , "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path ;
    const coverImageLocalPath = req.files?.coverImage[0]?.path ; 

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar file is required") ;
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath) ;
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) ;

    if(!avatar){
        throw new ApiError(400 , "Avatar file is required") ;
    }
    const user = await User.create({
        fullName ,
        avatar: avatar.url ,
        coverImage: coverImage?.url || "" ,
        email,
        password,
        userName: userName.toLowerCase()
    })
    const createduserName = await User.findById(user._id).select(
        "-password -refreshToken"
    ) ; 
    if(!createduserName) {
         throw  new ApiError(501 , "Something went while creating user!") ;
    }

    return res.status(201).json(
        new ApiResponse(200 , createduserName , "User created successfully")
    )
})

export { registerUser }