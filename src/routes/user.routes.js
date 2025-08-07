import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "./../middleWares/multer.middleware.js";

const router = Router();

//Whenever we redirected to /register and we will redirect to registerUser controller before registerUser we will use multer as a
//middleware for file means images here
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1, //maxCount is nothing but no of files you want to upload
    },
  ]),
  registerUser
);

export default router;
