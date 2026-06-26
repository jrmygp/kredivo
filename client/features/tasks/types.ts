export type ApiResponse<TData> = {
  code: number;
  status: string;
  data: TData;
  error?: string;
};

export type PaginationResponse<TData> = {
  code: number;
  status: string;
  data: TData;
  totalCount: number;
  firstRow: number;
  lastRow: number;
  totalPages: number;
};

export type TaskStatus = "active" | "completed";

export type TaskFilter = "all" | TaskStatus;

export type TaskSortBy = "title" | "status" | "created";

export type TaskSortOrder = "asc" | "desc";

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

export type GetTasksParams = {
  status?: TaskFilter;
  search?: string;
  page?: number;
  sortBy?: TaskSortBy;
  sortOrder?: TaskSortOrder;
};
