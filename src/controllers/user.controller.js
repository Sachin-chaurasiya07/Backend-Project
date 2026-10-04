import {asyncHandler} from "../utils/asyncHandler.js";
import { apiErrors } from "../utils/apiError.js";
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler( async(req,res)=>{
    //pehle email ya username lenge ( details from frontend)

    // validation - not empty - correct format

    // check krenge already exist (username or email ) karta hoga to usko already register ka message dekh login page par redirect kar denge

    // check of image and avatar 
    
    // upload them to cloudinary

    // create user object - create entry in DB

    // remove password and refresh token field from response

    //check for user creation 

    // return res

    const {fullName , email , password , username } = req.body
    console.log("Email : " , email)
    // console.log("\nusername : ", username)
    // console.log("\nFull Name : " ,fullName )

    if(fullName === ""){
        throw new apiErrors(400, "Full name is required")
    }
    if(password === ""){
        throw new apiErrors(400, "Password is required")
    }
    if(email === ""){
        throw new apiErrors(400, "Email is required")
    }
    if(username === ""){
        throw new apiErrors(400, "Username is required")
    }

    const existedUser = User.findOne({
        $or : [ {username} , {email}]
    })

    if(existedUser){

        throw new apiErrors(409 , "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiErrors(404 , "Avatar file is required")
    }
    
    const avatarFileUpload = await uploadOnCloudinary(avatarLocalPath)
    const coverImageFileUpload = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar){
        throw new apiErrors(404 , "Avatar file is required")
    }

    const user = await  User.createIndexes({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiErrors(500 , "Something went wrong while creating user")
    }

    return res.status(201).json(
        new apiResponse(200 ,createdUser ,  "User registered successfully ")
    )

})


export  {registerUser}