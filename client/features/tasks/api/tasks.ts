import axiosInstance from "@/config/axios";
import type {
  ApiResponse,
  CreateTaskPayload,
  Task,
  TaskFilter,
  UpdateTaskPayload,
} from "../types";

export const getTasks = async (status: TaskFilter = "all"): Promise<Task[]> => {
  const response = await axiosInstance.get<ApiResponse<Task[]>>("/api/tasks", {
    params: { status },
  });

  return response.data.data;
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
