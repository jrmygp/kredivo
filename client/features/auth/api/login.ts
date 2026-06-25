import axiosInstance from "@/config/axios";
import type { ApiResponse, LoginPayload, LoginResponse } from "../types";

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
    "/api/login",
    payload,
  );

  return response.data.data;
};
