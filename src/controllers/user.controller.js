import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOncloudinary } from "../utils/cloudinary.js"
import { Apiresponse } from "../utils/Apiresponse.js";
import { response } from "express";
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "some went wrong while generating refres and acess token")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    //getuser 
    //validation
    //check if use already exsist
    // check for images check for avatar
    //upload them to cloudinary
    //create use object -create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //retunr res
    const { fullname, email, username, password } = req.body
    console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required")
    }
    const exsistedUSEr = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (exsistedUSEr) {
        throw new ApiError(409, "user with same credential exsist already")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalpath = req.files?.coverImage[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOncloudinary(avatarLocalPath)
    const coverImage = await uploadOncloudinary(coverImageLocalpath)
    if (!avatar) {
        throw new ApiError(400, "kya kar rha hai bhai tu ")
    }
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createduser) {
        throw new ApiError(500, "Something went wriong while registering user")
    }
    return res.status(201).json(
        new Apiresponse(200, createduser, "User ban gaya sucessfully")
    )

})
const loginUser = asyncHandler(async (req, res) => {
    //req body ->data;
    //user name or email
    //find the user/
    //password check
    //acess and refresh token
    //sent cookie
    const { email, username, password } = req.body
    if (!username && !email) {
        throw new ApiError(400, "user or email is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "user does no exsist")
    }
    const is_pass_valdi = await user.isPasswordCorrect(password)

    if (!is_pass_valdi) {
        throw new ApiError(401, "Invalid user credential")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new Apiresponse(
                200,
                {
                user: loggedInUser, accessToken, refreshToken
                },
                "user logged in sucessfully"
            )
        )
})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new Apiresponse(200, {}, "USER loggedout "))
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken||req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user =await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken !==user?.refreshToken){
            throw new ApiError(401,"refresh token is expired or used")
        }
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new Apiresponse(
                200,{accessToken,refreshToken:newrefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token ")
    }

})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}