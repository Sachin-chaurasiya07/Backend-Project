import { Router } from "express";
import { loginUser, 
    logOutUser, 
    registerUser , 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory 
} from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {upload} from "../middlewares/multer.middleware.js"

const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser)

userRouter.route("/login").post(loginUser)

// secured route wala part

userRouter.route("/logout").post(verifyJWT , logOutUser)

userRouter.route("/refresh-token").post(refreshAccessToken)

userRouter.route("/change-password").post(verifyJWT , changeCurrentPassword)

userRouter.route("/current-user").post(verifyJWT , getCurrentUser)

userRouter.route("/update-account").patch(verifyJWT , updateAccountDetails)

userRouter.route("/avatar").patch(verifyJWT , upload.single("avatar"), updateUserAvatar)

userRouter.route("/cover").patch(verifyJWT , upload.single("/coverImage"), updateUserCoverImage)

userRouter.route("/c/:username").get(verifyJWT , getUserChannelProfile)

userRouter.route("/history").get(verifyJWT , getWatchHistory)

export {userRouter};