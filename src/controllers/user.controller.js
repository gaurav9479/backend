import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import {User} from "../models/user.model.js"
import {uploadOncloudinary} from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js";
const registerUser=asyncHandler(async(req,res)=>{
    //getuser 
    //validation
    //check if use already exsist
    // check for images check for avatar
    //upload them to cloudinary
    //create use object -create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //retunr res
    const{fullname,email,username,password}=req.body
    console.log("email: ",email);

    if(
        [fullname,email,username,password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"all fields are required")
    }
    const exsistedUSEr= await User.findOne({
        $or:[{username},{email}]
    })
    if(exsistedUSEr){
        throw new ApiError(409,"user with same credential exsist already")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalpath=req.files?.coverImage[0]?.path;
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    const avatar=await uploadOncloudinary(avatarLocalPath)
    const coverImage=await uploadOncloudinary(coverImageLocalpath)
    if(!avatar){
        throw new ApiError(400,"kya kar rha hai bhai tu ")
    }
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createduser){
        throw new ApiError(500,"Something went wriong while registering user")
    }
    return res.status(201).json(
        new Apiresponse(200,createduser,"User ban gaya sucessfully")
    )

})
export {
    registerUser,
}