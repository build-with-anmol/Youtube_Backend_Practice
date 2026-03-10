import asyncHandler from "../utils/asyncHandller.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get User Details
  // Validation -- Atlesta not empty
  // Check if user exists or not  : by the username and email
  // check for the imgs , and avatar
  // if img available then upload in cloudinary  -- get url
  // Create user Object -- create entry in db
  // remove pass and refresh token from response
  // check for user creation
  // return response

  // Get User Details

  const { fullName, username, email, password } = req.body;

  console.log("email : ", email, "password : ", password);

  // if ( fullName === "" || username === "" || email === "" || password === "" ) {
  //     throw new ApiError( 400 , "All fields are required" );
  // }
  // Validation -- Atlesta not empty

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // Check if user exists or not  : by the username and email

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with Email and Username already exists");
  }

  // Now Handling Avatar and Cover Image    // check for the imgs , and avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  // if img available then upload in cloudinary  -- get url

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Create user Object -- create entry in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", // If coverImage is not available then send empty string
    username: username.toLowerCase(),
    email,
    password,
  });

  const cretedUser = await User.findById(user._id).select(
    "-password  -refreshToken" // By using this we can remove the password and refresh token from the response
  );

  if (!cretedUser) {
    throw new ApiError(500, "Something went wrong while creating user... !");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, cretedUser, "User created successfully"));
});

export { registerUser };
