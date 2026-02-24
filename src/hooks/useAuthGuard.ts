"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import type { UserRole } from "@/types/api";
import { ROLE_DASHBOARD } from "@/lib/constants";

export function useAuthGuard(requiredRole?: UserRole) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      router.replace(ROLE_DASHBOARD[user.role]);
    }
  }, [isLoading, token, user, requiredRole, router]);

  return { ready: !isLoading && !!user, user };
}
