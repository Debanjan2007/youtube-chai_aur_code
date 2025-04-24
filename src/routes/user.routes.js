import express , {Router} from "express"; 
import {registerUser ,
    loginUser ,
    logeoutUser ,
    refreshAccessToken , 
    changeCurrentPassword , 
    getCurrentUser , 
    updateAccountdetails , 
    updateImage} from "../controllers/user.controller.js"
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
    uploadLOgUser.none(),
    verifyJwt ,
    logeoutUser) ;
router.route("/refresToken").post(refreshAccessToken)


// updating user details 
router.route("/update/password").post(
    uploadLOgUser.none(),
    verifyJwt ,
    changeCurrentPassword
)

router.route("/update/accounts").post(
    uploadLOgUser.none() ,
    verifyJwt , 
    updateAccountdetails
)

router.route("/update/image").post(
    upload.fields([
        {
        name: "avatar",
        maxCount: 1
        },
        {
            name: "coverImage" ,
            maxCount: 1
        }
    ]),
    verifyJwt , 
    updateImage
)

export {router}   ;
