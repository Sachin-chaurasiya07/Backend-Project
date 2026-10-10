import { Router } from "express";
import { loginUser, logOutUser, registerUser , refreshAccessToken } from "../controllers/user.controller.js";
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

export {userRouter};