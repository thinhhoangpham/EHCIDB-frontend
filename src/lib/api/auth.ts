import apiClient from "./client";
import type { AuthResponse } from "@/types/api";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login/", { email, password });
  return data;
}

// export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
//   const { data } = await apiClient.post<AuthResponse>("/auth/register/", { full_name: name, email, password });
//   return data;
// }

export async function register(
  name: string,
  email: string,
  password: string,
  gender: string,
  blood_type_code: string,
  date_of_birth: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register/", {
    full_name: name,
    email,
    password,
    gender,
    blood_type_code,
    date_of_birth,
  });

  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout/");
}
// export async function getBloodTypes() {
//   const { data } = await apiClient.get("/api/meta/blood-types/");
//   return data;
// }
export async function getBloodTypes(): Promise<any[]> {
  const { data } = await apiClient.get("/meta/blood-types/");
  return data;
}