// require('dotenv').config({path:"./env"})

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

import dotenv from "dotenv";

dotenv.config({
    path:"./env"
})


connectDB()




// import express from "express"
// const app=express()

// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL }/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERR: ",error);
//             throw error
//         })
//     }
//     catch(error){
//         console.error('ERROR: ',error)
//         throw err
//     }
// })()