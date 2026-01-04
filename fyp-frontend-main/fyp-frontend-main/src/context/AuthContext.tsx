"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser, login, register, deleteUser } from "../services/authService";
import { LoginRequest, RegisterRequest, User } from "../types/auth";
import nookies from "nookies";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterRequest
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch the user on initial load
  useEffect(() => {
    const fetchUser = async () => {
      const cookies = nookies.get(); // Get cookies on the client
      const token = cookies.accessToken; // Read the access token from cookies

      if (token) {
        const { success, data, error } = await getUser();
        if (success) {
          setUser(data?.user || null);
        } else {
          console.log("Failed to fetch user:", error);
          nookies.destroy(null, "accessToken"); // Clear the invalid token
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Login function
  const loginHandler = async (
    data: LoginRequest
  ): Promise<{ success: boolean; error?: string }> => {
    const { success, data: loginData, error } = await login(data);

    if (success && loginData) {
      // Store token in cookies
      nookies.set(null, "accessToken", loginData.accessToken, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/", // Make it available across the app
      });

      // Fetch user details
      const { success: userSuccess, data: userData } = await getUser();
      if (userSuccess) {
        setUser(userData?.user || null);
      }

      return { success: true };
    }

    return { success: false, error };
  };

  // Register function
  const registerHandler = async (
    data: RegisterRequest
  ): Promise<{ success: boolean; error?: string }> => {
    const { success, data: registerData, error } = await register(data);

    if (success && registerData) {
      // Store token in cookies
      nookies.set(null, "accessToken", registerData.token, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      // Set user
      setUser(registerData.user);
      return { success: true };
    }

    return { success: false, error };
  };

  // Logout function
  const logoutHandler = () => {
    nookies.destroy(null, "accessToken"); // Remove the access token
    setUser(null);
  };

  // Delete account function
  const deleteAccountHandler = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    const { success, error } = await deleteUser();
    if (success) {
      logoutHandler();
      return { success: true };
    }

    return { success: false, error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginHandler,
        register: registerHandler,
        logout: logoutHandler,
        deleteAccount: deleteAccountHandler,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
