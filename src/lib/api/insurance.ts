import apiClient from "./client";
import type { InsuranceProvider } from "@/types/api";

export const getProviders = () =>
  apiClient.get<InsuranceProvider[]>("/admin/insurance-providers/").then((r) => r.data);

export const addProvider = (data: Omit<InsuranceProvider, "id">) =>
  apiClient.post<InsuranceProvider>("/admin/insurance-providers/", data).then((r) => r.data);

export const updateProvider = (id: string, data: Partial<InsuranceProvider>) =>
  apiClient.patch<InsuranceProvider>(`/admin/insurance-providers/${id}/`, data).then((r) => r.data);

export const deleteProvider = (id: string) =>
  apiClient.delete(`/admin/insurance-providers/${id}/`);
