import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import { uploadOnCloudinary } from "./../utils/cloudinaryUploader.js";
import jwt from "jsonwebtoken";

//HelperFunction
async function generateRefreshAndAccessToken(userId) {
  //To Generate Refresh token and Access Token we have to first Get the user
  const existUser = await User.findById(userId);

  //After getting the user generate Refresh Token which we will save on dataBase
  const refreshToken = existUser.generateRefreshToken();
  const accessToken = existUser.generateAccessToken();

  //No update the existUser refreshToken bcoz when user created empty refresh Token
  existUser.refreshToken = refreshToken;
  existUser.save({ validateBeforeSave: false });

  //Now return
  return { refreshToken, accessToken };
}

//Register User
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

  //SOME LOGS
  console.log("Request Body");
  console.log(req.body);

  console.log(
    "--------------------------------------------------------------------------------------------------------------------"
  );
  console.log("Request Files");
  console.log(req.files);

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

//Login User
const loginUser = asyncHandler(async (req, res) => {
  //Get the data from User which they have entered
  const { username, email, password } = req.body;
  //Check whether the user have provide us the username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }
  //If user has given username or email => check the user correct or not
  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });
  //Check whether userExist not available means user is not registered
  if (!userExist) {
    throw new ApiError(404, "user does not exist");
  }
  //if user exist then now check the password
  //always remember methods that are made with schema model are available to userExist not User
  const isPasswordCorrectExistUser = await userExist.isPasswordCorrect(
    password
  );

  //If password is not correct then throw error
  if (!isPasswordCorrectExistUser) {
    throw new ApiError(401, "Invalid password");
  }

  //If password is correct then we will generate refreshToken and Access Token
  const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
    userExist._id
  );

  //If we have refreshToken and accessToken then send it as cookie
  // const { password: _, refreshToken: __, ...userData } = userExist.toObject();

  const loggedInUser = await User.findById(userExist._id).select(
    "-password -refreshToken"
  );

  //Send it cookie now
  res
    .status(200)
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully "
      )
    );
});

//Logout User
const logoutUser = asyncHandler(async (req, res) => {
  /*
     ->To logout we have to clear the refreshToken from the database
     ---->to do this we have to get the User mongoose and find the user but when we try to find it we dont have any reference to like _id to query and get the user
     ----> so we will use a middle which will verify the authenticated user and from that middleware we will get the user other info like _id and other info
     ----->if we get the _id then we will do a query in database and clear the refreshToken


     ->After clear refreshToken then we have to clear the cookie also
   
   */

  //STEP: 1 => Remove refreshToken removed from DataBase
  const userId = req?.user?._id;
  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  //STEP 2 =>Clear the cookie
  return res
    .status(200)
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    })
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
    })
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

//RefreshAccessToken => suppose user has access token and it is expired after 1hr => so we will make an endpoint so that user can get a new access token and can continue use the web without again entering email || username and Password
const RefreshAccessToken = asyncHandler(async (req, res) => {
  try {
    //First we will get the user and verify it so we will get it from the refresh token in the cookie
    const userExistingCookie = req.cookies?.refreshToken;

    //If user has no existing cookie means unauthorized
    if (!userExistingCookie) {
      throw new ApiError(401, "Unauthorized Request ");
    }
    const decodedUserExitingCookie = jwt.verify(
      userExistingCookie,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedUserExitingCookie?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    //Now match if the cookie stored refreshToken with database stored refreshToken
    if (userExistingCookie != user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    //So if match is right then give the user a refreshToken and an accessToken
    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
      user?._id
    );

    //Send the response
    res
      .status(200)
      .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .json(
        new ApiResponse(
          200,
          { refreshToken, accessToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//Get LoggedIn User Info Which we can show it in their profile
const userProfile = asyncHandler(async (req, res) => {
  //It is a secured route means auth.middlware.js will pass req.user from their we can get the user id and then find any related user info
  const user_id = req.user;

  if (!user_id) {
    throw new ApiError(401, "You are not logged in");
  }

  const user = await User.findById(user_id);

  const { username, email, fullName } = user;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { username, email, fullName },
        "User All Information"
      )
    );
});

export { registerUser, loginUser, logoutUser, RefreshAccessToken, userProfile };

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
