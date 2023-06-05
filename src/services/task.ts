import { parseStatusError } from "../utils/error";
import { ITEMS_PER_PAGE } from "../utils/pagination";
import Task from "../models/task";
import { AddTaskRequest, UpdateTaskRequest } from "../utils/types/request/task";
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

const getAllTasksService = async (filter: object = {}) => {
  try {
    const tasks = await Task.find(filter)
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

    const taskDefaultTime = new Date(Date.now());

    const newTask = new Task({
      title,
      description: description ?? "",
      time: time ? new Date(time) : taskDefaultTime,
      priority: priority ?? 4,
      subTasks: subTasks
        ? subTasks.map((i) => {
            return {
              title: i.title ?? "",
              description: i.description ?? "",
              time: i.time
                ? new Date(i?.time)
                : time
                ? new Date(time)
                : taskDefaultTime,
              priority: 4,
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
  } catch (error: any) {
    throw parseStatusError(error.message);
  }
};

const updateTaskService = async (
  updateTaskData: UpdateTaskRequest,
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

    if (subTasks) {
      let newSubTasksList = [...task.subTasks];

      // Add New Sub-Task
      if (subTasks.newSubTask && subTasks.newSubTask.title) {
        const newSubTaskData = subTasks.newSubTask;
        newSubTasksList.push({
          title: subTasks.newSubTask.title,
          time: newSubTaskData.time ? new Date(newSubTaskData.time) : task.time,
          priority: newSubTaskData.priority ?? 4,
          description: newSubTaskData.description ?? "",
          isDone: false,
        });
      }

      // Delete Sub-Task
      if (subTasks.removeSubTask) {
        newSubTasksList = newSubTasksList.filter(
          (subTask: any) => subTask?._id?.toString() !== subTasks.removeSubTask
        );
      }

      // Update Sub-Task
      if (subTasks.updateSubTask?.taskId && subTasks.updateSubTask?.data) {
        newSubTasksList = newSubTasksList.map((subTask: any) => {
          if (subTask?._id?.toString() === subTasks.updateSubTask?.taskId) {
            const updateData = subTasks.updateSubTask?.data;
            return {
              title: updateData?.title ?? subTask.title,
              time: updateData?.time ? new Date(updateData.time) : subTask.time,
              priority: updateData?.priority ?? subTask.priority,
              description: updateData?.description ?? subTask.description,
              isDone: updateData?.isDone ?? subTask.isDone,
            };
          } else {
            return subTask;
          }
        });
      }

      task.subTasks = newSubTasksList;
    }
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
  getAllTasksService,
};
