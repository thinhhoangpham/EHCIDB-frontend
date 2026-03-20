"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

export default function DoctorDashboardPage() {
  const { ready, user } = useAuthGuard("doctor");
  const { clearAuth } = useAuth();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };
  const handleSearch = () => {
    console.log(searchValue);
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user!.name}</h1>
          <input
            type="text"
            placeholder="Enter patient ID or emergency code"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"/>

          <Button onClick={handleSearch}>
            Search
          </Button>
          
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
