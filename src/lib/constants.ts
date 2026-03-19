import type { UserRole, BloodType } from "@/types/api";

export const ROLE_DASHBOARD: Record<UserRole, string> = {
  patient: "/dashboard/patient",
  doctor: "/dashboard/doctor",
  admin: "/dashboard/admin",
};

export const BLOOD_TYPES: BloodType[] = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

export const LOCAL_STORAGE_KEYS = {
  TOKEN: "ehcidb_token",
  REFRESH: "ehcidb_refresh",
  USER: "ehcidb_user",
  RECENT_SEARCHES: "ehcidb_recent_searches",
} as const;
