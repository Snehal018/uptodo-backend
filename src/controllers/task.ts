import express from "express";
import { parseStatusError, validatorErrorsHandler } from "../utils/error";
import Task from "../models/task";
import { AddTaskRequest } from "../utils/types/request/task";
import { ITEMS_PER_PAGE, parsePaginationResponse } from "../utils/pagination";
import { AppStrings } from "../utils/strings";
import User from "../models/user";

const getTasks = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  const page = req.query.page ?? 1;
  const search = req.query.search;
  const isDone = req.query.isDone;
  const date: string = req.query.date;

  const searchRegex = search ?? ".*";

  const [year, month, day] = date ? date.split("-") : [1, 1, 1];

  const getFilters = {
    user: req.userId,
    title: { $regex: searchRegex, $options: "i" },
    ...(isDone && { isDone: isDone }),
    ...(date && {
      time: {
        $gte: new Date(+year, +month - 1, +day, 0, 0, 0),
        $lt: new Date(+year, +month - 1, +day + 1, 0, 0, 0),
      },
    }),
  };

  console.log(getFilters);

  const totalTasksCount = await Task.countDocuments(getFilters);

  const tasks = await Task.find(getFilters)
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .populate("user", "_id username profileImage")
    .populate("category", "_id name color");

  res.status(200).json(parsePaginationResponse(tasks, page, totalTasksCount));
};

const createTask = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  validatorErrorsHandler(req);

  try {
    const { userId } = req;

    const { title, description, priority, time, category, subTasks } =
      req.body as AddTaskRequest;

    const newTask = new Task({
      title,
      description: description ?? "",
      time: time ? new Date(time) : new Date(Date.now()),
      priority: priority ?? 4,
      subTasks: subTasks
        ? subTasks.map((i) => {
            return {
              ...i,
              isDone: false,
            };
          })
        : [],
      category: category ?? null,
      user: userId,
      isDone: false,
    });

    const result = await newTask.save();

    const user = await User.findById(userId);

    if (user) {
      user.pendingTasksCount = (user?.pendingTasksCount ?? 0) + 1;
      await user?.save();
    }

    res
      .status(201)
      .json({ message: "Task Created Successfully", task: result });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  validatorErrorsHandler(req);
  try {
    const { taskId } = req.params;
    const { userId } = req;

    const { title, description, priority, time, category, subTasks, isDone } =
      req.body as AddTaskRequest;
    const task = await Task.findById(taskId);
    if (!task) {
      throw parseStatusError(AppStrings.noTaskFound, 404);
    }

    if (task.user?.toString() !== req.userId?.toString()) {
      throw parseStatusError(AppStrings.notAuthorized, 401);
    }

    const user = await User.findById(userId);

    if (user && isDone !== undefined && task.isDone !== isDone) {
      if (isDone) {
        user.pendingTasksCount = (user?.pendingTasksCount ?? 0) - 1;
        user.completedTasksCount = (user?.completedTasksCount ?? 0) + 1;
      } else {
        user.pendingTasksCount = (user?.pendingTasksCount ?? 0) + 1;
        user.completedTasksCount = (user?.completedTasksCount ?? 0) - 1;
      }
      await user?.save();
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.time = time ? new Date(time) : task.time;
    task.category = category ?? task.category;
    task.subTasks = subTasks
      ? subTasks.map((i) => {
          return {
            ...i,
            isDone: i?.isDone ?? false,
          };
        })
      : [];
    task.isDone = isDone ?? task?.isDone;

    const result = await task.save();
    res
      .status(200)
      .json({ message: "Task Updated Successfully", data: result });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { taskId } = req.params;
    const { userId } = req;

    const task = await Task.findById(taskId);

    if (!task) {
      throw parseStatusError(AppStrings.noTaskFound, 404);
    }

    if (task.user?.toString() !== req.userId?.toString()) {
      throw parseStatusError(AppStrings.notAuthorized, 401);
    }

    const user = await User.findById(userId);

    if (user) {
      if (task.isDone) {
        user.completedTasksCount = (user?.completedTasksCount ?? 0) - 1;
      } else {
        user.pendingTasksCount = (user?.pendingTasksCount ?? 0) - 1;
      }
      await user?.save();
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getSingleTask = async (
  req: any,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId)
      .populate("user", "_id username profileImage")
      .populate("category", "_id name color");

    if (!task) {
      throw parseStatusError(AppStrings.noTaskFound, 404);
    }

    if (task.user?.toString() !== req.userId?.toString()) {
      throw parseStatusError(AppStrings.notAuthorized, 401);
    }

    res.status(200).json({ date: task });
  } catch (error) {
    next(error);
  }
};

export { getTasks, getSingleTask, createTask, deleteTask, updateTask };
