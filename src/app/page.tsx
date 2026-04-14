"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_DASHBOARD } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Heart, Shield, Clock, Users } from "lucide-react";

export default function Home() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user && token) {
      router.push(ROLE_DASHBOARD[user.role]);
    }
  }, [user, token, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user && token) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">EHCIDB</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Emergency Healthcare
            <span className="block text-blue-600">Critical Information Database</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Instant, secure access to life-saving patient data during emergencies.
            When every second counts, ensure healthcare providers have the critical
            information they need to save lives.
          </p>
          <div className="mt-10 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            <Link href="/register">
              <Button className="w-full sm:w-auto px-8 py-3 text-lg">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="w-full sm:w-auto px-8 py-3 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h3 className="text-center text-3xl font-bold text-gray-900">
            Why Choose EHCIDB?
          </h3>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-gray-900">
                Instant Access
              </h4>
              <p className="mt-2 text-gray-600">
                Critical patient information available in seconds during emergencies.
              </p>
            </Card>

            <Card className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-gray-900">
                Secure & Private
              </h4>
              <p className="mt-2 text-gray-600">
                Built with security and privacy in mind.
              </p>
            </Card>

            <Card className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-gray-900">
                Role-Based Access
              </h4>
              <p className="mt-2 text-gray-600">
                Tailored dashboards for patients, doctors, and administrators.
              </p>
            </Card>

            <Card className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Heart className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-gray-900">
                Life-Saving Data
              </h4>
              <p className="mt-2 text-gray-600">
                Allergies, medications, conditions, and emergency contacts at your fingertips.
              </p>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20">
          <Card className="bg-blue-600 text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold">
                Ready to Save Lives?
              </h3>
              <p className="mt-4 text-blue-100">
                Join the Emergency Healthcare Critical Information Database today.
                Timely access to health information can improve emergency response.
              </p>
              <div className="mt-8">
                <Link href="/register">
                  <Button
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
                  >
                    Create Your Account
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 EHCIDB - Emergency Healthcare Critical Information Database</p>
            <p className="mt-2 text-sm">Academic prototype for CS5356 Advanced Database Systems</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
