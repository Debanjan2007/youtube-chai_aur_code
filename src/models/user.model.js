import mongoose , {Schema} from "mongoose";

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
    watcHistory : [
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

export const User = mongoose.model("User", userSchema);