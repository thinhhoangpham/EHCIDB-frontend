import apiClient from "./client";
import type { User, AccessLog } from "@/types/api";

export const getUsers = () =>
  apiClient.get<User[]>("/admin/users/").then((r) => r.data);

export const updateUser = (id: string, data: Partial<User>) =>
  apiClient.patch<User>(`/admin/users/${id}/`, data).then((r) => r.data);

export const deactivateUser = (id: string) =>
  updateUser(id, { is_active: false });

export const getAccessLogs = () =>
  apiClient.get<AccessLog[]>("/admin/access-logs/").then((r) => r.data);
