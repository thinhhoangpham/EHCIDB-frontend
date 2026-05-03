"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_DASHBOARD } from "@/lib/constants";
import { isValidEmail } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { AuthPageLayout } from "@/components/layout/AuthPageLayout";
import { getBloodTypes } from "@/lib/api/auth";


export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  // const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [bloodTypes, setBloodTypes] = useState<{ blood_type_code: string }[]>([]);



  useEffect(() => {
    const loadBloodTypes = async () => {
      try {
        const data = await getBloodTypes();
        setBloodTypes(data);
      } catch (err) {
        console.error("Failed to load blood types", err);
      }
    };

    loadBloodTypes();
  }, []);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setApiError("");
    // setSuccessMessage("");


    let isValid = true;

    if (!name.trim()) {
      setNameError("Name is required.");
      isValid = false;
    }

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
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);
    try {
      const data = await register(
        name,
        email,
        password,
        gender,
        bloodType,
        dateOfBirth
      );

      setAuth(data.user, data.access_token, data.refresh_token);
      router.push(ROLE_DASHBOARD[data.user.role]);
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";
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
      title="Register"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          id="name"
          type="text"
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={nameError}
        />

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
          id="gender"
          type="select"
          label="Gender"
          placeholder="Select Gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={[
            { label: "Male", value: "Male" },
            { label: "Female", value: "Female" },
            { label: "Other", value: "Other" },
          ]}
        />






        <Input
          id="dateOfBirth"
          type="date"
          label="Date of Birth"
          placeholder="Select Date of Birth"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />



        <Input
          id="bloodType"
          type="select"
          label="Blood Type"
          placeholder="Select Blood Type"
          value={bloodType}
          onChange={(e) => setBloodType(e.target.value)}
          options={bloodTypes.map((bt) => ({ label: bt.blood_type_code, value: bt.blood_type_code }))}
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

        <Input
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPasswordError}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Register
        </Button>

        {apiError && (
          <Alert variant="error">{apiError}</Alert>
        )}
      </form>
    </AuthPageLayout>
  );
}