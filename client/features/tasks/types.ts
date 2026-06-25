export type ApiResponse<TData> = {
  code: number;
  status: string;
  data: TData;
  error?: string;
};

export type TaskStatus = "active" | "completed";

export type TaskFilter = "all" | TaskStatus;

export type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
};

export type CreateTaskPayload = {
  title: string;
};

export type UpdateTaskPayload = {
  id: number;
  title?: string;
  status?: TaskStatus;
};
