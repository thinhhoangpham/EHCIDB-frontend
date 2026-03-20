"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const { ready, user } = useAuthGuard("admin");
  const { clearAuth } = useAuth();
  const router = useRouter();

  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleAddUser = () => {
    console.log({
      userName,
      role,
    });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user!.name}
          </h1>

          <input
            type="text"
            placeholder="Enter user name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          />

          <input
            type="text"
            placeholder="Enter role (admin, doctor, or patient)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          />

          <Button onClick={handleAddUser}>
            Add User
          </Button>

          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
