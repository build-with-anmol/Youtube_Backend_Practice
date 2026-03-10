import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlerware.js"; // This is the middleware which authenticate the user and check for the user details

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

export default router;
