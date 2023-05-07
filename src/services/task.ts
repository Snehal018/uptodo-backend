import { parseStatusError } from "../utils/error";
import { ITEMS_PER_PAGE } from "../utils/pagination";
import Task from "../models/task";
import { AddTaskRequest } from "../utils/types/request/task";
import { findUserByIdService } from "./user";
import { AppStrings } from "../utils/strings";
import { Types } from "mongoose";

const findTaskByIdService = async (taskId: string) => {
  try {
    return await Task.findById(taskId)
      .populate("user", "_id username profileImage")
      .populate("category", "_id name color");
  } catch (error) {
    throw parseStatusError();
  }
};

const getPaginatedTasksService = async (filter: object = {}, page = 1) => {
  try {
    const tasks = await Task.find(filter)
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate("user", "_id username profileImage")
      .populate("category", "_id name color");

    return tasks;
  } catch (error) {
    throw parseStatusError();
  }
};

const getTasksCountService = async (filter: object = {}) => {
  try {
    return await Task.countDocuments(filter);
  } catch (error) {
    throw parseStatusError();
  }
};

const createTaskService = async (
  createTaskData: AddTaskRequest,
  userId: string
) => {
  try {
    const { title, description, time, priority, subTasks, category } =
      createTaskData;
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

    const createdTask = await newTask.save();

    const user = await findUserByIdService(userId);
    if (user) {
      user.pendingTasksCount = (user?.pendingTasksCount ?? 0) + 1;
      await user?.save();
    }

    return createdTask;
  } catch (error) {
    throw parseStatusError();
  }
};

const updateTaskService = async (
  updateTaskData: AddTaskRequest,
  userId: string,
  taskId: string
) => {
  try {
    const { title, description, time, priority, subTasks, category, isDone } =
      updateTaskData;

    const task = await findTaskByIdService(taskId);
    if (!task) {
      throw parseStatusError(AppStrings.noTaskFound, 404);
    }

    if (task.user?._id?.toString() !== userId?.toString()) {
      throw parseStatusError(AppStrings.notAuthorized, 401);
    }

    const user = await findUserByIdService(userId);

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
    task.category = new Types.ObjectId(category) ?? task.category;
    task.subTasks = subTasks
      ? subTasks.map((i) => {
          return {
            ...i,
            isDone: i?.isDone ?? false,
          };
        })
      : [];
    task.isDone = isDone ?? task?.isDone;

    return await task.save();
  } catch (error: any) {
    throw parseStatusError(error.message);
  }
};

const deleteTaskService = async (userId: string, taskId: string) => {
  try {
    const task = await findTaskByIdService(taskId);
    if (!task) {
      throw parseStatusError(AppStrings.noTaskFound, 404);
    }
    if (task.user?._id?.toString() !== userId?.toString()) {
      throw parseStatusError(AppStrings.notAuthorized, 401);
    }

    const user = await findUserByIdService(userId);
    if (user) {
      if (task.isDone) {
        user.completedTasksCount = (user?.completedTasksCount ?? 0) - 1;
      } else {
        user.pendingTasksCount = (user?.pendingTasksCount ?? 0) - 1;
      }
      await user?.save();
    }
    await task.deleteOne();
  } catch (error: any) {
    throw parseStatusError(error.message);
  }
};

export {
  getPaginatedTasksService,
  getTasksCountService,
  createTaskService,
  updateTaskService,
  deleteTaskService,
  findTaskByIdService,
};
