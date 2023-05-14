import { Router } from "express";
import {
  createTask,
  deleteTask,
  getSingleTask,
  getTasks,
  updateTask,
} from "../controllers/task";
import { isAuth } from "../middleware/auth";
import { addTaskValidation, updateTaskValidation } from "../validators/task";

const taskRoutes = Router();

taskRoutes.post("", isAuth, addTaskValidation, createTask);

taskRoutes.get("", isAuth, getTasks);

taskRoutes.get("/:taskId", isAuth, getSingleTask);

taskRoutes.patch("/:taskId", isAuth, updateTaskValidation, updateTask);

taskRoutes.delete("/:taskId", isAuth, deleteTask);

export default taskRoutes;
