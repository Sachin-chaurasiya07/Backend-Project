import mongoose , {Schema} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'




const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    password : {
        type : String,
        required : [true , 'Password is required']
    },
    fullname : {
        type  : String,
        required : true,
        trim : true,
        index : true
    },
    avatar : {
        type : String, //url of image 

    },
    coverImage : {
        type : String //url of image from cloud platform

    },
    watchHistory : [
        {
            type : Schema.Types.ObjectId,
            ref : "Video"
        }
    ],
    refreshToken : {
        type : String

    }

}, { timestamps : true})

userSchema.pre("save" , async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password , 8)
    // next()
}
)

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            userName : this.username,
            fullName : this.fullname //udhar wala naam hai aur idhar wla database se aata hai this. ke baad whi name hona chaiye jo model me likha ho
            
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )

}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )

}

export const User = mongoose.model("User" , userSchema)