import { ApiResponse } from "@/types/auth";
import axios from "axios";
import httpClient from "./httpClient";

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  url: string,
  data?: unknown,
  requiresAuth: boolean = true
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // Dynamically add/remove Authorization header
    const headers = !requiresAuth ? { Authorization: undefined } : undefined;

    // Make the HTTP request
    const res = await httpClient.request<ApiResponse<T>>({
      method,
      url,
      data,
      headers,
    });

    const { response, error } = res.data;

    // Handle success response
    if (response) {
      return { success: true, data: response };
    }

    // Handle expected error response
    if (error) {
      return { success: false, error };
    }

    // If no response or error is provided, return an unexpected error
    return { success: false, error: "Unexpected API response structure." };
  } catch (err: unknown) {
    // Handle Axios errors explicitly
    if (axios.isAxiosError(err) && err.response) {
      const status = err.response.status;
      const data = err.response.data as ApiResponse<T>;

      // Handle expected error formats from the API
      if (data?.error) {
        return { success: false, error: data.error };
      }

      // Handle specific HTTP status codes
      if (status === 404) {
        return { success: false, error: "Resource not found." };
      }

      if (status === 401) {
        return { success: false, error: "Unauthorized. Please login again." };
      }

      if (status === 500) {
        return { success: false, error: "Internal server error." };
      }

      // Fallback for other known HTTP errors
      return { success: false, error: `HTTP Error: ${status}` };
    }

    // Handle unexpected errors (e.g., network issues)
    console.error("Unexpected API error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
