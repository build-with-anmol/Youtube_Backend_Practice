import asyncHandler from "../utils/asyncHandller.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // Save the refresh token in db without validation

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating tokens... !"
    );
  }
};

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

  //   console.log( req.body );

  //   console.log("email : ", email, "password : ", password);

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
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with Email and username already exists");
  }

  // Now Handling Avatar and Cover Image    // check for the imgs , and avatar

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // If coverImage is not available then send empty string also undefined will handle here
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //   console.log(coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  // if img available then upload in cloudinary  -- get url

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(avatarLocalPath);

  //   let coverImage = null;
  //   if (coverImageLocalPath) {
  //     coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //   }

  //   console.log("avatar : ", avatar.url);
  //   console.log("Cover image ", coverImage.url);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  // Create user Object -- create entry in db

  const user = await User.create({
    fullName,
    avatar: avatar?.url,
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

const loginUser = asyncHandler(async (req, res) => {
  // Login User
  // 0. get User Details -- req.body
  // 1. Check if user exists or not  : by the username and email
  // 2. Check for the password  if not then throw error or create user
  // 3. generate access token and refresh token -- Send Cookies
  // 4. Login the user by - username/email  and password
  // 5. return response

  // 0. get User Details -- req.body

  // console.log( req.body );

  const { email, username, password } = req.body;

  // console.log( email );

  // 1. Check if user exists or not  : by the username and email
  // if (!email || !username) {
  //   throw new ApiError(400, "Username or email is required");
  // }

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // 2. Check for the password  if not then throw error or create user
  const user = await User.findOne({ $or: [{ username }, { email }] });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  const isPasswordValid = await user.isPasswordMatched(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // If user logged in then send res except password and refresh token -- This is a optional Step
  const loggedInUser = await User.findById(user._id).select(
    "-password  -refreshToken" // By using this we can remove the password and refresh token from the response
  );

  // Send Cookies

  // Using this we can't modify the cookies from the Frontend -- we can only read the cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined || "",
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// If user wants to login again then send the refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshAccessToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request !");
  }

  console.log(incomingRefreshToken);

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = awaitUser.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token !");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or in Used !");
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token Refreshed and User logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token !");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const isPasswordCorrect = user.isPasswordMatched(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Old Password is incorrect !");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User fetched successfully"));
});

const updateAccoutDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (avatar?.url) {
    throw new ApiError(400, "Error while uploading Avatar...!");
  }
  User.findById(
    req.user._id,
    {
      $set: {
        avatar: avatar?.url,
      },
    },
    {
      new: true,
    }
  )
    .select("-password")
    .then((user) => {
      return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
    });
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is required");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (coverImage?.url) {
    throw new ApiError(400, "Error while uploading coverImage...!");
  }
  User.findById(
    req.user._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    {
      new: true,
    }
  )
    .select("-password")
    .then((user) => {
      return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updated successfully"));
    });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
