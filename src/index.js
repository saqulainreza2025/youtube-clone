import mongoose from "mongoose";
import connectDB from "./db/db.js";
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";

//DATABASE CONNECTION
//AS WE KNOW WE HAVE HANDLED AS AN ASYNC that data connection
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(
        "App is Running in Port from ➡️  Express ➡️   " + process.env.PORT
      );
    });
  })
  .catch((err) =>
    console.log(`This is an Error from MongoDB Connection` + err)
  );
