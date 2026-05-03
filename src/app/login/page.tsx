"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidEmail } from "@/lib/utils";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_DASHBOARD } from "@/lib/constants";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setApiError("");

    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = await login(email, password);
      setAuth(data.user, data.access_token, data.refresh_token);
      router.push(ROLE_DASHBOARD[data.user.role]);
    } catch (err: any) {
      let errorMessage = "Login failed. Please try again.";
      if (err?.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
        } else {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      title="Login"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
        />

        <Input
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Login
        </Button>

        {apiError && (
          <Alert variant="error">{apiError}</Alert>
        )}
      </form>
    </AuthPageLayout>
  );
}
