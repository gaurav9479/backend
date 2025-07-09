import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "unauthorized request")
        }
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decode?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid acess token")
    }
})
// export const verifyJWT = asyncHandler(async (req, _, next) => {
//     try {
//         const token =
//             req.cookies?.accessToken ||
//             req.header("Authorization")?.replace("Bearer ", "").trim();

//         console.log("🍪 Cookie accessToken:", req.cookies?.accessToken);
//         console.log("🔐 Authorization Header:", req.header("Authorization"));
//         console.log("📦 Final Token:", token);

//         if (!token) {
//             throw new ApiError(401, "unauthorized request");
//         }

//         const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//         const user = await User.findById(decode?._id).select("-password -refreshToken");

//         if (!user) {
//             throw new ApiError(401, "Invalid Access Token");
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.log("❌ JWT Error:", error);
//         throw new ApiError(401, error?.message || "invalid access token");
//     }
// });