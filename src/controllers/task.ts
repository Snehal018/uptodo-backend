import { NextFunction, Response } from "express";
import { parseStatusError, validatorErrorsHandler } from "../utils/error";
import { AddTaskRequest, UpdateTaskRequest } from "../utils/types/request/task";
import { parsePaginationResponse } from "../utils/pagination";
import { AppStrings } from "../utils/strings";
import {
  createTaskService,
  deleteTaskService,
  findTaskByIdService,
  getAllTasksService,
  getPaginatedTasksService,
  getTasksCountService,
  updateTaskService,
} from "../services/task";
import { AppRequestType } from "../utils/types";

const getTasks = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const page = req.query.page ? +req.query.page : 1;
  const search = req.query.search;
  const isDone = req.query.isDone;
  const date = req.query.date;
  const searchRegex = search ?? ".*";
  const isGetAllData = !!req.query?.allData;

  const [year, month, day] = !!(date && typeof date === "string")
    ? date.split("-")
    : [1, 1, 1];

  const filters = {
    user: req.userId,
    $or: [
      { title: { $regex: searchRegex, $options: "i" } },
      { description: { $regex: searchRegex, $options: "i" } },
    ],
    ...(isDone && { isDone: isDone }),
    ...(date && {
      time: {
        $gte: new Date(+year, +month - 1, +day, 0, 0, 0),
        $lt: new Date(+year, +month - 1, +day + 1, 0, 0, 0),
      },
    }),
  };
  try {
    const totalTasksCount = await getTasksCountService(filters);
    let tasks = [];
    let response = {};
    if (isGetAllData) {
      tasks = await getAllTasksService(filters);
      response = {
        data: tasks,
        count: totalTasksCount,
      };
    } else {
      tasks = await getPaginatedTasksService(filters, page);
      response = parsePaginationResponse(tasks, page, totalTasksCount);
    }
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const createTask = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  try {
    validatorErrorsHandler(req);
    const result = await createTaskService(
      req.body as AddTaskRequest,
      userId ?? ""
    );
    res
      .status(201)
      .json({ message: AppStrings.taskCreateSuccess, task: result });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { taskId } = req.params;
  const { userId } = req;
  try {
    validatorErrorsHandler(req);
    const result = await updateTaskService(
      req.body as UpdateTaskRequest,
      userId ?? "",
      taskId ?? ""
    );
    res
      .status(200)
      .json({ message: AppStrings.taskUpdateSuccess, data: result });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { taskId } = req.params;
  const { userId } = req;
  try {
    await deleteTaskService(userId ?? "", taskId);
    res.status(200).json({ message: AppStrings.taskDeleteSuccess });
  } catch (error) {
    next(error);
  }
};

const getSingleTask = async (
  req: AppRequestType,
  res: Response,
  next: NextFunction
) => {
  const { taskId } = req.params;
  try {
    const task = await findTaskByIdService(taskId);
    if (!task) {
      throw parseStatusError(AppStrings.noTaskFound, 404);
    }
    if (task.user?._id.toString() !== req.userId?.toString()) {
      throw parseStatusError(AppStrings.notAuthorized, 401);
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export { getTasks, getSingleTask, createTask, deleteTask, updateTask };
