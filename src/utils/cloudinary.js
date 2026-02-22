// In this part of file we manage all kind of uploading of files to cloudinary

import { v2 } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return "File not found" || null;

    // Upload the file to cloudinary
    const response = await cloudinary.v2.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File is uploaded on cloudinary successfully

    console.log("File is uploaded on cloudinary successfully", response.url);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);  // remove the locally saved temp file as the upload operation failed 
    // Delete the file from the server if it is not uploaded on cloudinary
    return null;
  }
};

export default uploadOnCloudinary;
