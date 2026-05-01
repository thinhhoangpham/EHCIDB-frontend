"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createDoctor } from "@/lib/api/admin";

export default function CreateDoctorModal({
    open,
    onClose,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        full_name: "",
        doctor_name: "",
    });

    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await createDoctor(form);
            onSuccess();
            onClose();
            setForm({
                username: "",
                email: "",
                password: "",
                full_name: "",
                doctor_name: "",
            });
        } catch {
            alert("Failed to create doctor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">

            {/* Modal */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-black">
                        Create New Doctor
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Grid inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        <Input
                            label="Username"
                            value={form.username}
                            onChange={(v) => handleChange("username", v)}
                        />

                        <Input
                            label="Email"
                            value={form.email}
                            onChange={(v) => handleChange("email", v)}
                        />

                        <Input
                            label="Full Name"
                            value={form.full_name}
                            onChange={(v) => handleChange("full_name", v)}
                        />

                        <Input
                            label="Doctor Name"
                            value={form.doctor_name}
                            onChange={(v) => handleChange("doctor_name", v)}
                        />

                        <div className="sm:col-span-2">
                            <Input
                                label="Password"
                                type="password"
                                value={form.password}
                                onChange={(v) => handleChange("password", v)}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full mt-4 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-900 transition disabled:opacity-50"
                    >
                        {loading ? "Creating Doctor..." : "Create Doctor"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------------------------
   Reusable Input Component
---------------------------- */

function Input({
    label,
    value,
    onChange,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-black
                   focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black
                   transition"
            />
        </div>
    );
}