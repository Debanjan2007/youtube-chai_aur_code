import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"; 
import bcrypt from "bcrypt";
import e from "express";

new userSchema = new Schema({
    userName : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true, //searchable very fast 
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
    },
    fullName : {
        type: String,
        required: true,
        trim: true,
        index: true, //searchable very fast 
    },
    avatar : {
        type: String, //clodnary url service will be used to store as image for free
        required: true,
    },
    coverImage : {
        type: String,
    },
    watchHistory : [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
    password : {
        type: String,
        required: [true , 'Password is required'],
    },
    refreshToken : {
        type: String,
    }
    
    
}, {timestamps : true}) ;

userSchema.pre("save" , async function (req , res , next) { //mainly uses for any validation in the server
    if(!this.isModified("password")){ 
        return next();
    }
    this.password = await bcrypt.hash(this.password , 10 ); // 10 defers how many salts shoukd be there ?? 
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password);
}

userSchema.methods.generateAccessToken = async function(){
    return await jwt.sign({
        _id: this._id,
        email: this.email,
        userName: this.userName,
        fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET ,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
)
}

userSchema.methods.generateRefreshToken = async function(){
    return await jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET ,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
)
}
export const User = mongoose.model("User", userSchema);