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

taskRoutes.post("/task", isAuth, addTaskValidation, createTask);

taskRoutes.get("/task", isAuth, getTasks);

taskRoutes.get("/task/:taskId", isAuth, getSingleTask);

taskRoutes.patch("/task/:taskId", isAuth, updateTaskValidation, updateTask);

taskRoutes.delete("/task/:taskId", isAuth, deleteTask);

export default taskRoutes;
