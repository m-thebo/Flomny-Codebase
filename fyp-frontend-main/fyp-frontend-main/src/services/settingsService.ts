// services/settingsService.ts
import { apiRequest } from "../utils/apiRequest";
import {
  GetUserResponse,
  EditUserRequest,
  EditUserResponse,
  DeleteUserResponse,
} from "../types/auth";

// Fetch User Profile
const getProfile = async (): Promise<{
  success: boolean;
  data?: GetUserResponse;
  error?: string;
}> => {
  return apiRequest<GetUserResponse>("GET", "/auth/");
};

// Update User Profile
const updateProfile = async (
  data: EditUserRequest
): Promise<{ success: boolean; data?: EditUserResponse; error?: string }> => {
  return apiRequest<EditUserResponse>("PATCH", "/auth/", data);
};

// Delete Account
const deleteAccount = async (): Promise<{
  success: boolean;
  data?: DeleteUserResponse;
  error?: string;
}> => {
  return apiRequest<DeleteUserResponse>("DELETE", "/auth/");
};

// Export all functions
const settingsService = {
  getProfile,
  updateProfile,
  deleteAccount,
};

export default settingsService;
