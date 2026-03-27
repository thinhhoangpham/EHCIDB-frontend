"use client";

import { useEffect, useCallback, useState } from "react";
import {
  Users,
  Activity,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useApi } from "@/hooks/useApi";
import { getDoctorDashboard } from "@/lib/api/dashboard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Spinner } from "@/components/ui/Spinner";

const TEST_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Abnormal: "#ef4444",
  Inconclusive: "#f59e0b",
};

const PIE_PALETTE = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function DoctorDashboardPage() {
  const { ready, user } = useAuthGuard("doctor");
  const { data, loading, error, execute } = useApi(getDoctorDashboard);
  const [patientSearch, setPatientSearch] = useState("");

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

  const { stats, patients, admissions_over_time, conditions_breakdown, test_results, recent_admissions } = data;

  const conditionData = conditions_breakdown.map((d) => ({ name: d.condition, value: d.count }));
  const testData = test_results.map((d) => ({ name: d.result, value: d.count }));

  const filteredPatients = patients.filter((p) =>
    p.patient_name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <DashboardShell>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        {user && (
          <p className="mt-1 text-sm text-gray-500">Welcome back, {user.name}</p>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="My Patients"
          value={stats.my_patients.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Admissions"
          value={stats.total_admissions.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Billing"
          value={`$${stats.avg_billing.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Length of Stay"
          value={`${stats.avg_length_of_stay.toFixed(1)} days`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Admissions Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={admissions_over_time} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} name="Admissions" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Conditions Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conditionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
              >
                {conditionData.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => (value as number).toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Test results chart */}
      <div className="mb-6">
        <ChartCard title="Test Results">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={testData}
                cx="50%"
                cy="50%"
                outerRadius={90}
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

      {/* My patients table with search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900">
            My Patients <span className="text-sm font-normal text-gray-400">({filteredPatients.length})</span>
          </h3>
          <input
            type="text"
            placeholder="Search by name..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full sm:w-60 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Gender</th>
                <th className="px-4 py-3 text-left font-medium">Blood Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    No patients found
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p, i) => (
                  <tr key={p.patient_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.patient_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.gender}</td>
                    <td className="px-4 py-3 text-gray-600">{p.blood_type}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent admissions table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Recent Admissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Patient</th>
                <th className="px-4 py-3 text-left font-medium">Hospital</th>
                <th className="px-4 py-3 text-left font-medium">Condition</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Medication</th>
                <th className="px-4 py-3 text-left font-medium">Test</th>
                <th className="px-4 py-3 text-left font-medium">Admitted</th>
                <th className="px-4 py-3 text-left font-medium">Discharged</th>
                <th className="px-4 py-3 text-right font-medium">Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent_admissions.map((row, i) => (
                <tr key={row.admission_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.patient_name}</td>
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
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.date_of_admission}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.discharge_date}</td>
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
