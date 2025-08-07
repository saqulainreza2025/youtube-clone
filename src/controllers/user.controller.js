import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation – not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  //create user object - create entry in mongoDB
  //remove password and refresh token field from response
  //check for user creation
  //return response

  const { email, password } = req.body;
  console.log(`Email: ${email} and Password: ${password}`);

  return res.status(201).json({
    success: "created",
    data: {
      user: {
        email,
        password,
      },
    },
  });
});

export { registerUser };
