export type ApiResponse<TData> = {
  code: number;
  status: string;
  data: TData;
  error?: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user_id: string;
};
