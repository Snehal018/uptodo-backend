import { check } from "express-validator";
import { parseStatusError } from "../utils/error";
import { AppStrings } from "../utils/strings";

export const signupValidation = [
  check("username", AppStrings.invalidUsername).isString().notEmpty().trim(),
  check("password", AppStrings.invalidPassword)
    .isString()
    .notEmpty()
    .isLength({ min: 6, max: 15 })
    .trim(),
  check("confirmPassword", AppStrings.invalidConfirmPassword)
    .isString()
    .notEmpty()
    .isLength({ min: 6, max: 15 })
    .custom((value, metaInfo) => {
      if (value.toString() !== metaInfo.req.body.password.toString()) {
        throw parseStatusError(AppStrings.invalidConfirmPassword, 400);
      }
      return true;
    })
    .trim(),
];

export const loginValidation = [
  check("username", AppStrings.invalidUsername).isString().notEmpty().trim(),
  check("password", AppStrings.invalidPassword)
    .isString()
    .notEmpty()
    .isLength({ min: 6, max: 15 })
    .trim(),
];

export const changePasswordValidation = [
  check("oldPassword", AppStrings.invalidPassword)
    .isString()
    .notEmpty()
    .isLength({ min: 6, max: 15 })
    .trim(),
  check("newPassword", AppStrings.invalidPassword)
    .isString()
    .notEmpty()
    .isLength({ min: 6, max: 15 })
    .trim(),
];

export const updateProfileValidation = [
  check("username").trim(),
  check("profileImage").trim(),
];
