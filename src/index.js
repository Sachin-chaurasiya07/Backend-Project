import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";

import dotenv from "dotenv"


dotenv.config({
    path : './.env'
})

//Second approach to connect


import connectDB from "./db/DB_index.js";

connectDB()








//First approach to connect 
/*
import express from "express";
const app = express()

;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error" , (error)=>{
            console.log("express error : ", error);
            throw error
        })
        
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.log("Error : ", error )
        
    }
    
})()
*/