import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const DB_URL = process.env.DB_URL;

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(DB_URL);

    console.log("✅ MongoDB Connected:", connectionInstance.connection.host);
  } catch (error) {
    // console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
