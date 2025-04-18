import express , {Router} from "express"; 
import {logeoutUser, loginUser, registerUser ,refreshAccessToken} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import multer from "multer";
const router = Router() ;

router.route("/register")
.post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage" ,
            maxCount: 1
        }
    ]) ,
    registerUser);
    const uploadLOgUser = multer() ;
router.route("/login")
.post(uploadLOgUser.none() , loginUser)

// secured routes 
router.route("/logout").post(
    verifyJwt ,
    logeoutUser) ;
router.route("/refresToken").post(refreshAccessToken)
// 

export {router}   ;
