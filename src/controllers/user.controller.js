import {asyncHandler} from "../utils/asyncHandler.js";
import { apiErrors } from "../utils/apiError.js";
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"





const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user  = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken , refreshToken}



    } catch (error) {
        console.error("Error in generateAccessAndRefreshTokens:", error)
        throw new apiErrors(500 , "Something went wrong while generating refresh and access token")
    }
}

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
    console.log("\nusername : ", username)
    console.log("\nFull Name : " ,fullName )
    
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

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

    const existedUser = await User.findOne({
        $or : [ {username} , {email}]
    })

    if(existedUser){

        throw new apiErrors(409 , "User already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath){
        throw new apiErrors(404 , "Avatar file is required")
    }
    
    const avatarFileUpload = await uploadOnCloudinary(avatarLocalPath)
    const coverImageFileUpload = await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatarFileUpload){
        throw new apiErrors(404 , "Avatar Uploaded failed")
    }

    const user = await  User.create({
        fullname : fullName,
        avatar : avatarFileUpload.url,
        coverImage : coverImageFileUpload?.url || "",
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

const loginUser = asyncHandler(async (req , res)=>{

    // take data

    // check if username or email is in correct format

    // check and verify if user exists

    // check password

    // generate access and refresh token

    // send cookie

    // and send response of successful login

    const  { email , username , password} = req.body
    console.log(email)

    if(!(username || email)){
        throw new apiErrors(400 , "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username} ,{ email}]
    })

    if(!user) {
        throw new apiErrors(404 , "User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiErrors(401 , "Invalid user credentials")
    }

    const {accessToken , refreshToken} =  await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken" ,accessToken , options )
    .cookie("refreshToken", refreshToken , options)
    .json(
        new apiResponse(  //apiResponse me check kro statusCode , data aur message ka object bna hoga this lgakr
            200 ,
            {
                user : loggedInUser ,
                accessToken ,
                refreshToken,

            },
            "User logged in Successfully"
        )
    )

} )

const logOutUser = asyncHandler(async(req , res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(new apiResponse(200 , {} , "User logged Out"))

})

const refreshAccessToken = asyncHandler(async (req , res)=>
    {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken


        if(!incomingRefreshToken){
            throw new apiErrors(201 , "Unauthorized request")
        }
        try {
            
            const decodedToken = jwt.verify(
                incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
            )
        
            const user = await User.findById(decodedToken?._id)
            
            if(!user){
                throw new apiErrors(201 , "Unauthorized request")
            }

            if(incomingRefreshToken !== user?.refreshToken){

                throw new apiErrors(401 , "Refresh token is expired or used")
            }

            const {accessToken , newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
            const options = {
                httpOnly: true ,
                secure : true
            }

            return res
            .status(200)
            .cookie("accessToken" , accessToken , options)
            .cookie("refreshToken" , newRefreshToken , options)
            .json(
                new apiResponse(
                    200 ,
                    { accessToken , refreshToken : newRefreshToken},
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new apiErrors(401 , error?.message || "Invalid refresh token")

    }

    }
)


export  {loginUser, registerUser , logOutUser , refreshAccessToken}