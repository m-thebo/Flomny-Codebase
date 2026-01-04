export interface Timestamp {
  seconds: number;
  nanos: number;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  signin_method: string | undefined;
  credits: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface SocialAuthRequest {
  token: string;
}

export interface SocialAuthResponse {
  token: string;
  user: User;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GetUserRequest {}

export interface GetUserResponse {
  user: User;
}

export interface EditUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
}

export interface EditUserResponse {
  user: User;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteUserRequest {}

export interface DeleteUserResponse {
  user: User;
}

export interface ApiResponse<T> {
  response?: T;
  error?: string;
}
