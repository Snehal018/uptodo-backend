export interface SubTaskType {
  title: string;
  description: string;
  time: Date;
  priority: number;
  isDone?: boolean;
}

export interface UpdateSubTaskRequest {
  newSubTask: Partial<SubTaskType>;
  removeSubTask: string;
  updateSubTask: {
    taskId: string;
    data: Partial<SubTaskType>;
  };
}

export interface AddTaskRequest {
  title: string;
  description: string;
  time: Date;
  priority: number;
  category?: string;
  subTasks?: Partial<SubTaskType>[];
  isDone?: boolean;
}
export interface UpdateTaskRequest {
  title: string;
  description: string;
  time: Date;
  priority: number;
  category?: string;
  isDone?: boolean;
  subTasks?: Partial<UpdateSubTaskRequest>;
}
