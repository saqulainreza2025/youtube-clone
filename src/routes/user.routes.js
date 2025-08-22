import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { loginUser } from "../controllers/user.controller.js";
import { upload } from "./../middleWares/multer.middleware.js";
import { verifyJWT } from "../middleWares/auth.middleware.js";
import {
  logoutUser,
  RefreshAccessToken,
  userProfile,
  changeCurrentPassword,
  changeUserFullName,
  changeAvatar,
  getWatchHistory,
} from "../controllers/user.controller.js";

const router = Router();

//Whenever we redirected to /register and we will redirect to registerUser controller before registerUser we will use multer as a
//middleware for file means images here
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//Secured Route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/userprofile").get(verifyJWT, userProfile);
router.route("/changeCurrentPassword").post(verifyJWT, changeCurrentPassword);
router.route("/changefullname").post(verifyJWT, changeUserFullName);
router
  .route("/changeAvatar")
  .patch(verifyJWT, upload.single("avatar"), changeAvatar);

router.route("/watchhistory").get(verifyJWT);
//Non Secured Route
router.route("/refresh-token").post(RefreshAccessToken, getWatchHistory);

export default router;
