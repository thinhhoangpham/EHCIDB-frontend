"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

export default function PatientDashboardPage() {
  const { ready, user } = useAuthGuard("patient");
  const { clearAuth } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleSubmit = () => {
    console.log({
      fullName,
      bloodType,
      allergies,
      emergencyContact,
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
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          />

          <input
            type="text"
            placeholder="Blood type"
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          />

          <input
            type="text"
            placeholder="Allergies"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          />

          <input
            type="text"
            placeholder="Emergency contact"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
          />

          <Button onClick={handleSubmit}>
            Save Information
          </Button>

          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}