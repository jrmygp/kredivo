import axiosInstance from "@/config/axios";
import type { ApiResponse } from "@/features/tasks/types";
import type { TaskStats } from "../types";

export const getTaskStats = async (): Promise<TaskStats> => {
  const response = await axiosInstance.get<ApiResponse<TaskStats>>("/api/stats");

  return response.data.data;
};
