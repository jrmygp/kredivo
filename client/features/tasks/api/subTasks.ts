import axiosInstance from "@/config/axios";
import type {
  ApiResponse,
  CreateSubTaskPayload,
  DeleteSubTaskPayload,
  SubTask,
  UpdateSubTaskPayload,
} from "../types";

export const getSubTasks = async (taskId: number): Promise<SubTask[]> => {
  const response = await axiosInstance.get<ApiResponse<SubTask[]>>(
    `/api/tasks/${taskId}/sub-tasks`,
  );

  return response.data.data;
};

export const createSubTask = async ({
  taskId,
  title,
}: CreateSubTaskPayload): Promise<SubTask> => {
  const response = await axiosInstance.post<ApiResponse<SubTask>>(
    `/api/tasks/${taskId}/sub-tasks`,
    { title },
  );

  return response.data.data;
};

export const updateSubTask = async ({
  taskId,
  id,
  ...payload
}: UpdateSubTaskPayload): Promise<SubTask> => {
  const response = await axiosInstance.put<ApiResponse<SubTask>>(
    `/api/tasks/${taskId}/sub-tasks/${id}`,
    payload,
  );

  return response.data.data;
};

export const deleteSubTask = async ({
  taskId,
  id,
}: DeleteSubTaskPayload): Promise<SubTask> => {
  const response = await axiosInstance.delete<ApiResponse<SubTask>>(
    `/api/tasks/${taskId}/sub-tasks/${id}`,
  );

  return response.data.data;
};
