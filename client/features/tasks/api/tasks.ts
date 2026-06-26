import axiosInstance from "@/config/axios";
import type {
  ApiResponse,
  CreateTaskPayload,
  GetTasksParams,
  PaginationResponse,
  Task,
  UpdateTaskPayload,
} from "../types";

export const getTasks = async ({
  status = "all",
  search = "",
  page = 1,
  sortBy = "created",
  sortOrder = "desc",
}: GetTasksParams = {}): Promise<PaginationResponse<Task[]>> => {
  const response = await axiosInstance.get<PaginationResponse<Task[]>>("/api/tasks", {
    params: { status, search, page, sortBy, sortOrder },
  });

  return response.data;
};

export const createTask = async (
  payload: CreateTaskPayload,
): Promise<Task> => {
  const response = await axiosInstance.post<ApiResponse<Task>>(
    "/api/tasks",
    payload,
  );

  return response.data.data;
};

export const updateTask = async ({
  id,
  ...payload
}: UpdateTaskPayload): Promise<Task> => {
  const response = await axiosInstance.put<ApiResponse<Task>>(
    `/api/tasks/${id}`,
    payload,
  );

  return response.data.data;
};

export const deleteTask = async (id: number): Promise<Task> => {
  const response = await axiosInstance.delete<ApiResponse<Task>>(
    `/api/tasks/${id}`,
  );

  return response.data.data;
};
