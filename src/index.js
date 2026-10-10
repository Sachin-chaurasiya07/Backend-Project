import mongoose from "mongoose";
import { DB_NAME } from "./constant.js";
import { app } from "./app.js";
import dotenv from "dotenv"


dotenv.config({
    path : './.env'
})

//Second approach to connect


import connectDB from "./db/DB_index.js";

connectDB()
.then(()=>{
    app.on("Error", (error)=>{
        console.log("Error : ", error);
        throw error
    });
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running on port : ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log(`MongoDB connection failed : `, error)
})







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