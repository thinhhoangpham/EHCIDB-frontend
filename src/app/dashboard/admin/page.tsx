// frontend/src/app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, Users, Activity, Stethoscope, DollarSign, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import {
  getUsers,
  updateUser,
  getAccessLogs,
  getInsuranceProviders,
  addInsuranceProvider,
  deleteInsuranceProvider,
} from "@/lib/api/emergency";
import type { UserEntry, AccessLogEntry, InsuranceProvider } from "@/lib/api/emergency";
import { StatCard } from "@/components/dashboard/StatCard";
import { getAdminDashboard } from "@/lib/api/dashboard";
import type { AdminDashboard } from "@/lib/api/dashboard";

import CreateDoctorModal from "@/components/admin/CreateDoctorModal";

type TabId = "analytics" | "users" | "logs" | "insurance";

const PAGE_LIMIT = 20;

// ---- Tab button ----
function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition",
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}

// ---- Pagination controls ----
function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-600">
      <span>
        Page {page} of {totalPages || 1}
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="text-xs px-3 py-1 h-auto"
          onClick={onPrev}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          className="text-xs px-3 py-1 h-auto"
          onClick={onNext}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

// ---- User Management tab ----
function UserManagementTab() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const fetch = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsers(p, PAGE_LIMIT);
      setUsers(result.users);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  const handleToggleActive = async (user: UserEntry) => {
    setTogglingId(user.user_id);
    try {
      await updateUser(user.user_id, { is_active: !user.is_active });
      await fetch(page);
    } catch {
      // silently refresh — list will reflect actual state
      await fetch(page);
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = filter.trim()
    ? users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(filter.toLowerCase()) ||
        u.email.toLowerCase().includes(filter.toLowerCase()) ||
        u.username.toLowerCase().includes(filter.toLowerCase())
    )
    : users;

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Filter input */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full sm:w-72 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="px-5 py-4 text-sm text-red-600">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">User ID</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Username</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filtered.map((u, i) => (
                    <tr key={u.user_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-gray-500 tabular-nums">{u.user_id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {u.full_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.username}</td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : u.role === "doctor"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          )}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                            u.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          )}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant={u.is_active ? "danger" : "secondary"}
                          className="text-xs px-3 py-1 h-auto"
                          loading={togglingId === u.user_id}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </div>
  );
}

// ---- Access Logs tab ----
function AccessLogsTab() {
  const [logs, setLogs] = useState<AccessLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const fetch = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAccessLogs(p, PAGE_LIMIT);
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="px-5 py-4 text-sm text-red-600">{error}</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">User</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Patient</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log, i) => (
                    <tr key={log.log_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {log.user_name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{log.action}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.target_patient_name ?? (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </div>
  );
}

// ---- Insurance Providers tab ----
function InsuranceProvidersTab() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addValues, setAddValues] = useState({ provider_name: "", payer_phone: "" });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getInsuranceProviders();
      setProviders(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSubmitting(true);
    try {
      await addInsuranceProvider(addValues);
      setAddValues({ provider_name: "", payer_phone: "" });
      setShowAddForm(false);
      await fetch();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to add provider");
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteInsuranceProvider(id);
      await fetch();
    } catch {
      await fetch();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Add provider button / inline form */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
        {showAddForm ? (
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Provider Name
              </label>
              <input
                type="text"
                value={addValues.provider_name}
                onChange={(e) => setAddValues((v) => ({ ...v, provider_name: e.target.value }))}
                placeholder="e.g. Blue Cross"
                required
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                value={addValues.payer_phone}
                onChange={(e) => setAddValues((v) => ({ ...v, payer_phone: e.target.value }))}
                placeholder="e.g. 1-800-1234"
                required
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            {addError && <p className="w-full text-xs text-red-600">{addError}</p>}
            <div className="flex gap-2">
              <Button type="submit" loading={addSubmitting} className="text-sm px-3 py-1.5 h-auto">
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-sm px-3 py-1.5 h-auto"
                onClick={() => {
                  setShowAddForm(false);
                  setAddError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="primary"
            className="text-sm px-3 py-1.5 h-auto flex items-center gap-1.5"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Provider
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="px-5 py-4 text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Provider Name</th>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                    No insurance providers recorded
                  </td>
                </tr>
              ) : (
                providers.map((p, i) => (
                  <tr key={p.provider_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.provider_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.payer_phone}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.provider_id)}
                        disabled={deletingId === p.provider_id}
                        className="flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                      >
                        {deletingId === p.provider_id ? (
                          <Spinner size="sm" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Helpers ----
function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

// ---- Analytics tab ----
const ADMISSION_TYPE_COLORS: Record<string, string> = {
  Emergency: "#ef4444",
  Urgent: "#f59e0b",
  Elective: "#3b82f6",
};

const GENDER_COLORS: Record<string, string> = {
  Male: "#3b82f6",
  Female: "#ec4899",
};

const TEST_RESULT_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Abnormal: "#ef4444",
  Inconclusive: "#f59e0b",
};

function AnalyticsTab() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAdminDashboard()
      .then((result) => {
              console.log("📊 ADMIN DASHBOARD JSON:", result);
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load analytics");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm px-5 py-8 text-sm text-red-600">
        {error ?? "No data available."}
      </div>
    );
  }

  const recentAdmissions = data.recent_admissions.slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Patients"
          value={String(data.stats.total_patients)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Admissions"
          value={String(data.stats.total_admissions)}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Total Doctors"
          value={String(data.stats.total_doctors)}
          icon={<Stethoscope className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Billing"
          value={formatCurrency(data.stats.avg_billing)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Length of Stay"
          value={`${data.stats.avg_length_of_stay} days`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admissions Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.admissions_over_time}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admissions by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.admissions_by_type} dataKey="count" nameKey="type" cx="50%" cy="50%">
                {data.admissions_by_type.map((entry) => (
                  <Cell
                    key={entry.type}
                    fill={ADMISSION_TYPE_COLORS[entry.type] ?? "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => String(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Conditions</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={data.top_conditions.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="condition" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: unknown) => String(value)} />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing by Insurance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={data.billing_by_insurance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="provider" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: unknown) => String(value)} />
              <Bar dataKey="total" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Demographics — Gender</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.demographics.gender}
                dataKey="count"
                nameKey="gender"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
              >
                {data.demographics.gender.map((entry) => (
                  <Cell
                    key={entry.gender}
                    fill={GENDER_COLORS[entry.gender] ?? "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => String(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.demographics.age_groups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="group" />
              <YAxis />
              <Tooltip formatter={(value: unknown) => String(value)} />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data.test_results} dataKey="count" nameKey="result" cx="50%" cy="50%">
                {data.test_results.map((entry) => (
                  <Cell
                    key={entry.result}
                    fill={TEST_RESULT_COLORS[entry.result] ?? "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: unknown) => String(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent admissions table */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Recent Admissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Patient</th>
                <th className="px-4 py-3 text-left font-medium">Doctor</th>
                <th className="px-4 py-3 text-left font-medium">Hospital</th>
                <th className="px-4 py-3 text-left font-medium">Condition</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Admitted</th>
                <th className="px-4 py-3 text-left font-medium">Discharged</th>
                <th className="px-4 py-3 text-left font-medium">Billing</th>
              </tr>
            </thead>
            <tbody>
              {recentAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    No admissions found
                  </td>
                </tr>
              ) : (
                recentAdmissions.map((admission, i) => (
                  <tr
                    key={admission.admission_id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {admission.patient_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {admission.doctor_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {admission.hospital_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{admission.medical_condition}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                          admission.admission_type === "Emergency"
                            ? "bg-red-100 text-red-800"
                            : admission.admission_type === "Urgent"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        )}
                      >
                        {admission.admission_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">
                      {formatDate(admission.date_of_admission)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap tabular-nums">
                      {formatDate(admission.discharge_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 tabular-nums whitespace-nowrap">
                      {formatCurrency(admission.billing_amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Main page ----
export default function AdminDashboardPage() {
  const { ready } = useAuthGuard("admin");
  const [activeTab, setActiveTab] = useState<TabId>("analytics");
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);


  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardShell>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Administrator Dashboard</h1>
        <div className="mt-4">
          <button
            onClick={() => setDoctorModalOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-80"
          >
            + Add Doctor
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Manage user roles, access logs, and database entries securely.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl border border-gray-100 shadow-sm p-2">
        <Tab active={activeTab === "analytics"} onClick={() => setActiveTab("analytics")}>
          Analytics
        </Tab>
        <Tab active={activeTab === "users"} onClick={() => setActiveTab("users")}>
          User Management
        </Tab>
        <Tab active={activeTab === "logs"} onClick={() => setActiveTab("logs")}>
          Access Logs
        </Tab>
        <Tab active={activeTab === "insurance"} onClick={() => setActiveTab("insurance")}>
          Insurance Providers
        </Tab>
      </div>

      {/* Tab content */}
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "users" && <UserManagementTab />}
      {activeTab === "logs" && <AccessLogsTab />}
      {activeTab === "insurance" && <InsuranceProvidersTab />}
      <CreateDoctorModal
        open={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        onSuccess={() => {
          alert("Doctor created successfully");
        }}
      />
    </DashboardShell>
  );
}
