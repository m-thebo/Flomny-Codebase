// services/authService.ts
import { apiRequest } from "../utils/apiRequest";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  GetUserResponse,
  EditUserRequest,
  EditUserResponse,
  DeleteUserResponse,
} from "../types/auth";

// Login
export const login = async (
  data: LoginRequest
): Promise<{ success: boolean; data?: LoginResponse; error?: string }> => {
  return await apiRequest<LoginResponse>("POST", "/auth/login", data, false);
};

// Register
export const register = async (
  data: RegisterRequest
): Promise<{ success: boolean; data?: RegisterResponse; error?: string }> => {
  return apiRequest<RegisterResponse>("POST", "/auth/register", data, false);
};

// Get User
export const getUser = async (): Promise<{
  success: boolean;
  data?: GetUserResponse;
  error?: string;
}> => {
  return apiRequest<GetUserResponse>("GET", "/auth/");
};

// Edit User
export const editUser = async (
  data: EditUserRequest
): Promise<{ success: boolean; data?: EditUserResponse; error?: string }> => {
  return apiRequest<EditUserResponse>("PATCH", "/auth/", data);
};

// Delete User
export const deleteUser = async (): Promise<{
  success: boolean;
  data?: DeleteUserResponse;
  error?: string;
}> => {
  return apiRequest<DeleteUserResponse>("DELETE", "/auth/");
};
