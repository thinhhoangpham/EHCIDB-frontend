import apiClient from "./client";
import type { AuthResponse } from "@/types/api";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login/", { email, password });
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout/");
}
