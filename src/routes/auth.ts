import { Router } from "express";
import { loginValidation, signupValidation } from "../validators/user";
import { postLogin, postSignup } from "../controllers/auth";

const authRoutes = Router();

authRoutes.post("/signup", signupValidation, postSignup);

authRoutes.post("/login", loginValidation, postLogin);

export default authRoutes;
