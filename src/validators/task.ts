import { check } from "express-validator";
import { AppStrings } from "../utils/strings";

const addTaskValidation = [
  check("title", AppStrings.invalidTaskTitle).isString().notEmpty().trim(),
  check("description", AppStrings.invalidTaskDescription)
    .isString()
    .trim()
    .optional(),
  check("time", AppStrings.invalidTaskTime).isString().optional(),
  check("priority", AppStrings.invalidTaskPriority).isNumeric().optional(),
  check("category", AppStrings.invalidTaskCategory).isAlphanumeric().optional(),
  check("subtasks", AppStrings.invalidTaskSubtasks).isArray().optional(),
];

const updateTaskValidation = [
  check("title", AppStrings.invalidTaskTitle).isString().optional().trim(),
  check("description", AppStrings.invalidTaskDescription)
    .isString()
    .trim()
    .optional(),
  check("time", AppStrings.invalidTaskTime).isString().optional(),
  check("priority", AppStrings.invalidTaskPriority).isNumeric().optional(),
  check("category", AppStrings.invalidTaskCategory).isAlphanumeric().optional(),
  check("subtasks", AppStrings.invalidTaskSubtasks).isArray().optional(),
];

export { addTaskValidation, updateTaskValidation };
