"use client";

import { useEffect, useCallback } from "react";
import {
  Users,
  Activity,
  Stethoscope,
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
import { getAdminDashboard } from "@/lib/api/dashboard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Spinner } from "@/components/ui/Spinner";

const TYPE_COLORS: Record<string, string> = {
  Emergency: "#ef4444",
  Urgent: "#f59e0b",
  Elective: "#3b82f6",
};

const TEST_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Abnormal: "#ef4444",
  Inconclusive: "#f59e0b",
};

const GENDER_COLORS: Record<string, string> = {
  Male: "#3b82f6",
  Female: "#ec4899",
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

export default function AdminDashboardPage() {
  const { ready } = useAuthGuard("admin");
  const { data, loading, error, execute } = useApi(getAdminDashboard);

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

  const { stats, admissions_over_time, admissions_by_type, top_conditions,
    billing_by_insurance, demographics, test_results, recent_admissions } = data;

  const typeData = admissions_by_type.map((d) => ({ name: d.type, value: d.count }));
  const genderData = demographics.gender.map((d) => ({ name: d.gender, value: d.count }));
  const ageData = demographics.age_groups.map((d) => ({ name: d.group, count: d.count }));
  const testData = test_results.map((d) => ({ name: d.result, value: d.count }));

  return (
    <DashboardShell>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">System-wide analytics and operational overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Patients"
          value={stats.total_patients.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Admissions"
          value={stats.total_admissions.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Total Doctors"
          value={stats.total_doctors.toLocaleString()}
          icon={<Stethoscope className="h-5 w-5" />}
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

        <ChartCard title="Admissions by Type">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                nameKey="name"
              >
                {typeData.map((entry) => (
                  <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => (value as number).toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Top 10 Conditions">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={top_conditions.slice(0, 10).map((d) => ({ name: d.condition, count: d.count }))}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" name="Cases" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Billing by Insurance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={billing_by_insurance.map((d) => ({ name: d.provider, total: d.total }))}
              margin={{ top: 5, right: 10, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => `$${(v as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
              <Bar dataKey="total" fill="#10b981" name="Total Billed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Demographics — Gender">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
              >
                {genderData.map((entry) => (
                  <Cell key={entry.name} fill={GENDER_COLORS[entry.name] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => (value as number).toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ageData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" name="Patients" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Test Results">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={testData}
                cx="50%"
                cy="50%"
                outerRadius={80}
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
                <th className="px-4 py-3 text-left font-medium">Doctor</th>
                <th className="px-4 py-3 text-left font-medium">Hospital</th>
                <th className="px-4 py-3 text-left font-medium">Condition</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Admitted</th>
                <th className="px-4 py-3 text-left font-medium">Discharged</th>
                <th className="px-4 py-3 text-right font-medium">Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent_admissions.map((row, i) => (
                <tr key={row.admission_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.patient_name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.doctor_name}</td>
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
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.date_of_admission}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.discharge_date}</td>
                  <td className="px-4 py-3 text-right text-gray-900 font-medium whitespace-nowrap">
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
