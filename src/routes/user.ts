import { Router } from "express";
import {
  deleteUser,
  getUser,
  postChangePassword,
  postLogin,
  postSignup,
  updateUser,
} from "../controllers/user";
import {
  changePasswordValidation,
  loginValidation,
  signupValidation,
  updateProfileValidation,
} from "../validators/user";
import { isAuth } from "../middleware/auth";
import multer from "multer";
import { fileFilter } from "../utils/multerFileFilter";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/images");
  },
  filename: function (req, file, cb) {
    cb(null, "profileImage" + "-" + uuidv4() + ".png");
  },
});

const userRoutes = Router();

userRoutes.post("/signup", signupValidation, postSignup);

userRoutes.post("/login", loginValidation, postLogin);

userRoutes.get("/user", isAuth, getUser);

userRoutes.delete("/user", isAuth, deleteUser);

userRoutes.post(
  "/change-password",
  isAuth,
  changePasswordValidation,
  postChangePassword
);

userRoutes.patch(
  "/user",
  isAuth,
  updateProfileValidation,
  multer({
    fileFilter: fileFilter,
    storage: storage,
  }).single("profileImage"),
  updateUser
);

export default userRoutes;
