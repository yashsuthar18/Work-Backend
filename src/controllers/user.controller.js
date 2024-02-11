import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessTokenAndRefereshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const accessRefresh = user.generateRefreshToken()

        user.refreshToken = accessRefresh
        await user.save({ validateBeforeSave: true })

        return { accessToken, accessRefresh }

    } catch (error) {
        throw new ApiError(500, "Something went wrong enerateAccessTokenAndRefereshToken")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend 
    // validation - not empty
    // check if user already exists : username or email
    // check for images , check for avatar
    //upload them to cloudinary , avatar
    // create user object - crate entry in db
    // remove password and refresh token feed from response
    //check for user creation 
    //return responce 


    const { username, email, fullName, password } = req.body


    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username is exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")

    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImages = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        avatar: avatar.url,
        coverImage: coverImages?.url || "Not Uploaded",
        email,
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )

    if (!createdUser) {
        throw new ApiError(500, "Somthing went wrong registering User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
});


const loginUser = asyncHandler(async (req, res) => {
    // Request body
    // User email 
    // Find user
    // Password check
    // Access and refresh tokens 
    // Send cookie


    const { email, username, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or email required")
    }

    const user = await User.findOne({
        $or: [
            { email },
            { username }
        ]
    })

    if (!user) {
        throw new ApiError(404, "user dose note exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "password in correct")
    }

    const { accessToken, accessRefresh } = await generateAccessTokenAndRefereshToken(user._id)

    const logdInUser = await User.findById(user._id)
        .select("-refreshToken -password")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", accessRefresh, options)
        .json(
            new ApiResponse(
                200,
                { user: logdInUser, accessToken, accessRefresh },
                "user loged in successfull..."
            )
        )
})

//LOGOUT
const logOutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id
        , {
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
        .json( new ApiResponse(200,{},"User Logd Out"))
})


export { registerUser, loginUser, logOutUser }