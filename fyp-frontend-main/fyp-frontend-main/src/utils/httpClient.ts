import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import nookies from "nookies";

const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach Bearer Token
httpClient.interceptors.request.use(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (config: InternalAxiosRequestConfig<any>) => {
    const cookies = nookies.get(); // Get cookies on the client
    const token = cookies.accessToken; // Read the accessToken from cookies

    if (token) {
      // Ensure headers are initialized
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

// Generic Error Handling
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally here if needed
    console.log("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default httpClient;
