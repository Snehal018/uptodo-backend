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
  category?: string;
  subTasks?: SubTaskType[];
  isDone?: boolean;
}
