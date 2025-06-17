// require('dotenv').config({path:"./env"})

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";

import dotenv from "dotenv";
import { app } from "./app.js";



dotenv.config({
    path:"./env"
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed!!!",err);
})





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