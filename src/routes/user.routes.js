import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js"; // This is the middleware which authenticate the user and check for the user details
import { verifyJwt } from "../middlewares/auth.middlerware.js";

const router = Router();

router
  .route("/register")
  .post(
    upload.fields([
      { name: "avatar", maxCount: 1 },
      ,
      { name: "coverImage", maxCount: 1 },
    ]),
    registerUser
  );

router.route("/login").post(loginUser);

// Secure Routes
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
