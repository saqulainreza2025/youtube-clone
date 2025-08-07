import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import { uploadOnCloudinary } from "./../utils/cloudinaryUploader.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { username, email, fullName, password } = req.body;

  //validation – not empty
  if (
    [username, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //check if user already exists: username, email
  const userExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExist) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // check for images, check for avatar
  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path || "";

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // upload them to cloudinary, avatar
  const avatarCloudinaryURL = await uploadOnCloudinary(avatarLocalPath);
  const coverImageCloudinaryURL = await uploadOnCloudinary(coverImageLocalPath);

  //create user object - create entry in mongoDB
  const user = await User.create({
    username,
    email,
    password,
    fullName,
    avatar: avatarCloudinaryURL,
    coverImage: coverImageCloudinaryURL || "",
  });

  //remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully"));
});

export { registerUser };

// get user details from frontend
// validation – not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
//create user object - create entry in mongoDB
//remove password and refresh token field from response
//check for user creation
//return response

// username
// email
// fullName
// avatar
// coverImage
// password
// refreshToken
// watchHistory
