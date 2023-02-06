import { check } from "express-validator";
import { AppStrings } from "../utils/strings";

export const addCategoryValidation = [
  check("name", AppStrings.invalidCategoryName).isString().notEmpty().trim(),
  check("color", AppStrings.invalidCategoryColor)
    .isHexColor()
    .notEmpty()
    .trim(),
];
