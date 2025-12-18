import { apiClient } from "../../../lib/api";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "../types/auth";
export const loginApi = async (payload: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/login/access-token", payload);
  return data;
};

export const registerApi = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  const { data } = await apiClient.post<RegisterResponse>("/users/register", payload);
  return data;
};

export const logoutApi = async (): Promise<void> => {
  await apiClient.post("/login/logout");
};
