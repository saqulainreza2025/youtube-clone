import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  //We have user cookieParser and also set the cookie which set req.cookie as an object and hold some user info
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized User");
    }

    //If verify then we will get the object which we had give some info like _id and all
    const authenticatedUser = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!authenticatedUser) {
      throw new ApiError(401, "Unauthorized User with wrong Access Token");
    }

    //if user is authorized then we have an object which hold _id then we will query to the database and get the user
    const user = await User.findById(authenticatedUser?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorised User");
    }

    //now send the user with the help of req object
    req.user = user;

    //call next so it can pass info to other middleware
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
