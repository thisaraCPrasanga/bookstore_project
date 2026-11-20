import { isAxiosError } from "axios";
import { apiClient } from "../../../lib/api-client";

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserResponse,
} from "../../../types/auth";

export async function fetchCsrfToken(): Promise<void> {
  await apiClient.get<void>("/auth/csrf");
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  await fetchCsrfToken();
  const response = await apiClient.post<LoginResponse>(
    "/users/login",
    credentials,
  );

  return response.data;
}

export async function register(userData: RegisterRequest): Promise<UserResponse> {
  await fetchCsrfToken();
  const response = await apiClient.post<UserResponse>(
    "/users/register",
    userData,
  );

  return response.data;
}

export async function logout(): Promise<void> {
  await fetchCsrfToken();
  await apiClient.post<void>("/users/logout");
}

export async function getCurrentUser(signal?: AbortSignal): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/users/me", { signal });
  return response.data;
}

interface AuthProblem {
  detail?: string;
  errors?: Record<string, string>;
}

export function getAuthError(error: unknown, fallback: string): string {
  if (!isAxiosError<AuthProblem>(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const response = error.response;
  if (!response) return "Could not reach the bookstore. Please try again.";

  const { data, status } = response;
  if (status === 403) return "The security check failed. Please try again.";
  if (status === 400 && data?.errors) {
    return Object.values(data.errors).join(" ") || fallback;
  }
  if (status === 400 || status === 401 || status === 409) {
    return data?.detail || fallback;
  }

  return fallback;
}
