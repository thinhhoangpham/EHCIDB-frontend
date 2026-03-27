"use client";

import { useEffect, useCallback } from "react";
import {
  Activity,
  DollarSign,
  Heart,
  Stethoscope,
  User,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useApi } from "@/hooks/useApi";
import { getPatientDashboard } from "@/lib/api/dashboard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Spinner } from "@/components/ui/Spinner";

const BILLING_PALETTE = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

const TEST_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Abnormal: "#ef4444",
  Inconclusive: "#f59e0b",
};

const CONDITION_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-red-100 text-red-700",
  "bg-cyan-100 text-cyan-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

const MEDICATION_COLORS = [
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
  "bg-violet-100 text-violet-700",
  "bg-lime-100 text-lime-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-yellow-100 text-yellow-700",
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function PatientDashboardPage() {
  const { ready } = useAuthGuard("patient");
  const { data, loading, error, execute } = useApi(getPatientDashboard);

  const load = useCallback(() => { execute(); }, [execute]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <DashboardShell>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          Failed to load dashboard data: {error}
        </div>
      </DashboardShell>
    );
  }

  if (!data) return null;

  const { profile, admissions, doctors, conditions, medications, billing_summary, test_results } = data;

  const billingData = billing_summary.by_insurance.map((d) => ({ name: d.provider, value: d.total }));
  const testData = test_results.map((d) => ({ name: d.result, value: d.count }));

  return (
    <DashboardShell>
      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.patient_name}</h1>
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
              <span>{profile.gender}</span>
              <span>Blood Type: <span className="font-semibold text-gray-700">{profile.blood_type}</span></span>
              <span>{profile.total_admissions} admission{profile.total_admissions !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Admissions"
          value={profile.total_admissions.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Total Billed"
          value={`$${billing_summary.total_billed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Conditions"
          value={conditions.length.toLocaleString()}
          icon={<Heart className="h-5 w-5" />}
          subtitle="Distinct conditions recorded"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Billing by Insurance">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={billingData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
              >
                {billingData.map((entry, index) => (
                  <Cell key={entry.name} fill={BILLING_PALETTE[index % BILLING_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: unknown) => `$${(v as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Test Results">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={testData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
              >
                {testData.map((entry) => (
                  <Cell key={entry.name} fill={TEST_COLORS[entry.name] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => (value as number).toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Info cards row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* My Doctors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-blue-500" />
            My Doctors
          </h3>
          {doctors.length === 0 ? (
            <p className="text-sm text-gray-400">No doctors on record</p>
          ) : (
            <ul className="space-y-2">
              {doctors.map((d) => (
                <li key={d.doctor_id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {d.doctor_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* My Conditions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            My Conditions
          </h3>
          {conditions.length === 0 ? (
            <p className="text-sm text-gray-400">No conditions on record</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {conditions.map((c, i) => (
                <span
                  key={c}
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${CONDITION_COLORS[i % CONDITION_COLORS.length]}`}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* My Medications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500" />
            My Medications
          </h3>
          {medications.length === 0 ? (
            <p className="text-sm text-gray-400">No medications on record</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {medications.map((m, i) => (
                <span
                  key={m}
                  className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${MEDICATION_COLORS[i % MEDICATION_COLORS.length]}`}
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admission history table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Admission History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Doctor</th>
                <th className="px-4 py-3 text-left font-medium">Hospital</th>
                <th className="px-4 py-3 text-left font-medium">Condition</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Medication</th>
                <th className="px-4 py-3 text-left font-medium">Test Result</th>
                <th className="px-4 py-3 text-right font-medium">Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admissions.map((row, i) => (
                <tr key={row.admission_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.date_of_admission}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.doctor_name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.hospital_name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.medical_condition}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.admission_type === "Emergency"
                        ? "bg-red-100 text-red-700"
                        : row.admission_type === "Urgent"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {row.admission_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.medication}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      row.test_result === "Normal"
                        ? "bg-green-100 text-green-700"
                        : row.test_result === "Abnormal"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {row.test_result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 whitespace-nowrap">
                    ${row.billing_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
