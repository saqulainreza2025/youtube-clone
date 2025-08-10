import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({
  path: "../../.env",
});

// STEP-1: Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_USERNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// STEP-2: Upload Function
async function uploadOnCloudinary(filePath) {
  try {
    if (!filePath) return null;

    // Upload file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // auto-detect image/video
    });

    console.log(
      `✅ File uploaded successfully: ${cloudinaryResponse.secure_url}`
    );

    // Remove local file after upload
    fs.unlinkSync(filePath);

    return cloudinaryResponse.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);

    // Remove local file if upload failed
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return null;
  }
}

export { uploadOnCloudinary };
