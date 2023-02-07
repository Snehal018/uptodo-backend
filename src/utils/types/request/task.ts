import { ObjectId } from "mongodb";
import { Schema } from "mongoose";

export interface SubTaskType {
  title: string;
  description: string;
  time: Date;
  priority: number;
  isDone?: boolean;
}

export interface AddTaskRequest {
  title: string;
  description: string;
  time: Date;
  priority: number;
  category?: any;
  subTasks?: SubTaskType[];
  isDone?: boolean;
}
