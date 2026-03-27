"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Search,
  AlertTriangle,
  Users,
  Activity,
  DollarSign,
  Clock,
} from "lucide-react";
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
} from "recharts";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import {
  searchPatients,
  getPatientEmergencyCard,
} from "@/lib/api/emergency";
import type { PatientProfile, PatientSearchResult } from "@/lib/api/emergency";
import { getDoctorDashboard } from "@/lib/api/dashboard";
import type { DoctorDashboard } from "@/lib/api/dashboard";

// ---- Blood type badge ----
const BLOOD_TYPE_COLORS: Record<string, string> = {
  "O+": "bg-red-100 text-red-800",
  "O-": "bg-red-200 text-red-900",
  "A+": "bg-blue-100 text-blue-800",
  "A-": "bg-blue-200 text-blue-900",
  "B+": "bg-green-100 text-green-800",
  "B-": "bg-green-200 text-green-900",
  "AB+": "bg-purple-100 text-purple-800",
  "AB-": "bg-purple-200 text-purple-900",
};

function BloodTypeBadge({ bloodType }: { bloodType: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-bold",
        BLOOD_TYPE_COLORS[bloodType] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {bloodType}
    </span>
  );
}

// ---- Severity badge ----
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Severe: "bg-red-100 text-red-800",
    Moderate: "bg-yellow-100 text-yellow-800",
    Mild: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-1.5 py-0.5 text-xs font-semibold",
        styles[severity] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {severity.slice(0, 3).toUpperCase()}
    </span>
  );
}

// ---- Emergency card (read-only) ----
function EmergencyCard({ card }: { card: PatientProfile }) {
  const hasCritical = card.conditions.some((c) => c.critical_flag);

  return (
    <div className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      {/* Critical banner */}
      {hasCritical && (
        <div className="flex items-center gap-2 bg-red-600 px-5 py-2.5 text-white">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-semibold">CRITICAL CONDITIONS PRESENT</span>
        </div>
      )}

      {/* Patient header */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Patient</span>
          <p className="font-semibold text-gray-900">{card.patient_name}</p>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Emergency ID</span>
          <p className="font-mono font-semibold text-gray-900">{card.emergency_identifier}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Blood Type</span>
          <BloodTypeBadge bloodType={card.blood_type} />
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Gender</span>
          <p className="font-medium text-gray-900">{card.gender}</p>
        </div>
      </div>

      {/* Two-column detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">

        {/* Left column */}
        <div className="divide-y divide-gray-100">
          {/* Allergies */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Allergies
            </h4>
            {card.allergies.length === 0 ? (
              <p className="text-sm text-gray-400">None recorded</p>
            ) : (
              <ul className="space-y-1">
                {card.allergies.map((a) => (
                  <li key={a.allergy_id} className="flex items-center gap-2 text-sm text-gray-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {a.allergy_name}
                    <SeverityBadge severity={a.severity} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Medications */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Medications
            </h4>
            {card.medications.length === 0 ? (
              <p className="text-sm text-gray-400">None recorded</p>
            ) : (
              <ul className="space-y-1">
                {card.medications.map((m) => (
                  <li key={m.medication_id} className="text-sm text-gray-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-2 flex-shrink-0" />
                    {m.medication_name}{" "}
                    <span className="text-gray-500 text-xs">{m.dosage}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Emergency contacts */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Emergency Contact
            </h4>
            {card.emergency_contacts.length === 0 ? (
              <p className="text-sm text-gray-400">None recorded</p>
            ) : (
              <ul className="space-y-1.5">
                {card.emergency_contacts.map((c) => (
                  <li key={c.contact_id} className="text-sm text-gray-800">
                    <span className="font-medium">{c.contact_name}</span>
                    <span className="text-gray-500"> — {c.relationship}, {c.phone_number}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="divide-y divide-gray-100">
          {/* Conditions */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Conditions
            </h4>
            {card.conditions.length === 0 ? (
              <p className="text-sm text-gray-400">None recorded</p>
            ) : (
              <ul className="space-y-1">
                {card.conditions.map((c) => (
                  <li key={c.condition_id} className="flex items-center gap-2 text-sm text-gray-800">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        c.critical_flag ? "bg-red-500" : "bg-gray-400"
                      )}
                    />
                    {c.condition_name}
                    {c.critical_flag && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-800">
                        CRITICAL
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Devices */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Devices
            </h4>
            {card.devices.length === 0 ? (
              <p className="text-sm text-gray-400">None recorded</p>
            ) : (
              <ul className="space-y-1">
                {card.devices.map((d) => (
                  <li key={d.device_id} className="text-sm text-gray-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block mr-2 flex-shrink-0" />
                    {d.device_name}
                    <span className="text-gray-500 text-xs"> ({d.device_type})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Insurance */}
          <div className="px-5 py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Insurance
            </h4>
            {card.insurance === null ? (
              <p className="text-sm text-gray-400">None recorded</p>
            ) : (
              <div className="text-sm text-gray-800 space-y-0.5">
                <p>
                  <span className="font-medium">{card.insurance.provider_name}</span>
                  <span className="text-gray-500"> ({card.insurance.plan_type})</span>
                </p>
                <p className="text-gray-600">{card.insurance.coverage_status}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Draggable Popup ----
function DraggableCardPopup({
  card,
  loading,
  error,
  onClose,
}: {
  card: PatientProfile | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const show = loading || error !== null || card !== null;
  if (!show) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Draggable card */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl bg-white"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        {/* Drag handle + close */}
        <div
          className="flex items-center justify-between px-5 py-3 bg-gray-100 rounded-t-xl cursor-move select-none border-b border-gray-200"
          onMouseDown={handleMouseDown}
        >
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Emergency Card
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-1">
          {loading && (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          )}
          {error && (
            <div className="m-4 rounded-lg bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {card && !loading && <EmergencyCard card={card} />}
        </div>
      </div>
    </div>
  );
}

// ---- Emergency Search Tab ----
interface EmergencySearchTabProps {
  searches: ReturnType<typeof useRecentSearches>["searches"];
  addSearch: ReturnType<typeof useRecentSearches>["addSearch"];
}

function EmergencySearchTab({ searches, addSearch }: EmergencySearchTabProps) {
  const [query, setQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PatientSearchResult[] | null>(null);

  const [cardLoading, setCardLoading] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<PatientProfile | null>(null);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setSearchError(null);
    setSearchLoading(true);
    setSelectedCard(null);
    setCardError(null);

    try {
      const results = await searchPatients(q);
      setSearchResults(results);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  }, [query]);

  const handleViewPatient = useCallback(async (result: PatientSearchResult) => {
    setCardError(null);
    setCardLoading(true);
    setSelectedCard(null);

    try {
      const card = await getPatientEmergencyCard(result.emergency_identifier);
      setSelectedCard(card);
      addSearch({
        emergencyId: result.emergency_identifier,
        name: result.patient_name,
        bloodType: result.blood_type,
      });
    } catch (err: unknown) {
      setCardError(err instanceof Error ? err.message : "Failed to load patient card");
    } finally {
      setCardLoading(false);
    }
  }, [addSearch]);

  return (
    <>
      {/* Search bar */}
      <div className="mb-6 rounded-xl bg-white border border-gray-100 shadow-sm p-5">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Emergency ID or patient name..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <Button type="submit" loading={searchLoading} className="text-sm">
            Search
          </Button>
        </form>
        {searchError && (
          <p className="mt-2 text-sm text-red-600">{searchError}</p>
        )}
      </div>

      {/* Search results list */}
      {searchResults !== null && (
        <div className="mb-6 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Search Results{" "}
              <span className="font-normal text-gray-400">({searchResults.length})</span>
            </h3>
          </div>
          {searchResults.length === 0 ? (
            <p className="px-5 py-4 text-sm text-gray-400">No patients found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Emergency ID</th>
                    <th className="px-4 py-3 text-left font-medium">Patient Name</th>
                    <th className="px-4 py-3 text-left font-medium">Blood Type</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((r, i) => (
                    <tr key={r.patient_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3 font-mono text-gray-700">{r.emergency_identifier}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.patient_name}</td>
                      <td className="px-4 py-3">
                        <BloodTypeBadge bloodType={r.blood_type} />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="secondary"
                          className="text-xs px-3 py-1 h-auto"
                          onClick={() => handleViewPatient(r)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Patient card popup */}
      <DraggableCardPopup
        card={selectedCard}
        loading={cardLoading}
        error={cardError}
        onClose={() => { setSelectedCard(null); setCardError(null); }}
      />

      {/* Recent searches */}
      {searches.length > 0 && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Emergency ID</th>
                  <th className="px-4 py-3 text-left font-medium">Patient Name</th>
                  <th className="px-4 py-3 text-left font-medium">Blood Type</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {searches.map((s, i) => (
                  <tr key={s.emergencyId} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-mono text-gray-700">{s.emergencyId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-4 py-3">
                      <BloodTypeBadge bloodType={s.bloodType} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="secondary"
                        className="text-xs px-3 py-1 h-auto"
                        onClick={() =>
                          handleViewPatient({
                            patient_id: 0,
                            emergency_identifier: s.emergencyId,
                            patient_name: s.name,
                            blood_type: s.bloodType,
                          })
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ---- Analytics Tab ----

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

const TEST_RESULT_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Abnormal: "#ef4444",
  Inconclusive: "#f59e0b",
};

const ADMISSION_TYPE_STYLES: Record<string, string> = {
  Emergency: "bg-red-100 text-red-800",
  Urgent: "bg-yellow-100 text-yellow-800",
  Elective: "bg-blue-100 text-blue-800",
};

const TEST_RESULT_STYLES: Record<string, string> = {
  Normal: "bg-green-100 text-green-800",
  Abnormal: "bg-red-100 text-red-800",
  Inconclusive: "bg-yellow-100 text-yellow-800",
};

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DoctorDashboard | null>(null);

  // Patient card state
  const [patientFilter, setPatientFilter] = useState("");
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);
  const [patientCardLoading, setPatientCardLoading] = useState(false);
  const [patientCardError, setPatientCardError] = useState<string | null>(null);
  const [patientCard, setPatientCard] = useState<PatientProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDoctorDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
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

  const handleViewCardByName = useCallback(async (patientName: string) => {
    setSelectedPatientName(patientName);
    setPatientCardError(null);
    setPatientCardLoading(true);
    setPatientCard(null);

    try {
      const results = await searchPatients(patientName);
      if (results.length === 0) {
        setPatientCardError("Patient not found");
        setPatientCardLoading(false);
        return;
      }
      const card = await getPatientEmergencyCard(results[0].emergency_identifier);
      setPatientCard(card);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load patient card";
      setPatientCardError(msg);
    } finally {
      setPatientCardLoading(false);
    }
  }, []);

  const handleCloseCard = useCallback(() => {
    setPatientCard(null);
    setPatientCardError(null);
    setSelectedPatientName(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
        {error ?? "Failed to load analytics data."}
      </div>
    );
  }

  const { stats } = data;

  const filteredAdmissions = data.recent_admissions.filter((a) =>
    a.patient_name.toLowerCase().includes(patientFilter.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          value={formatCurrency(stats.avg_billing)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Avg Length of Stay"
          value={`${stats.avg_length_of_stay} days`}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admissions Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Admissions Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.admissions_over_time}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Conditions Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conditions Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.conditions_breakdown}
                dataKey="count"
                nameKey="condition"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {data.conditions_breakdown.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Test Results pie chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.test_results}
                dataKey="count"
                nameKey="result"
                cx="50%"
                cy="50%"
                outerRadius={110}
              >
                {data.test_results.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={TEST_RESULT_COLORS[entry.result] ?? PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Admissions & Patients table */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-700">
            My Admissions{" "}
            <span className="font-normal text-gray-400">({data.recent_admissions.length})</span>
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              placeholder="Filter by patient name..."
              className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Patient</th>
                <th className="px-4 py-3 text-left font-medium">Hospital</th>
                <th className="px-4 py-3 text-left font-medium">Condition</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Test Result</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Billing</th>
                <th className="px-4 py-3 text-left font-medium">Emergency Card</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-400">
                    No admissions found
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((a, i) => (
                  <tr key={a.admission_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-900">{a.patient_name}</td>
                    <td className="px-4 py-3 text-gray-700">{a.hospital_name}</td>
                    <td className="px-4 py-3 text-gray-700">{a.medical_condition}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                          ADMISSION_TYPE_STYLES[a.admission_type] ?? "bg-gray-100 text-gray-700"
                        )}
                      >
                        {a.admission_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                          TEST_RESULT_STYLES[a.test_result] ?? "bg-gray-100 text-gray-700"
                        )}
                      >
                        {a.test_result}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{a.date_of_admission}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatCurrency(a.billing_amount)}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="secondary"
                        className="text-xs px-3 py-1 h-auto"
                        loading={patientCardLoading && selectedPatientName === a.patient_name}
                        onClick={() => handleViewCardByName(a.patient_name)}
                      >
                        View Card
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Patient card popup */}
        <DraggableCardPopup
          card={patientCard}
          loading={patientCardLoading}
          error={patientCardError}
          onClose={handleCloseCard}
        />
      </div>
    </div>
  );
}

// ---- Tab type ----
type Tab = "search" | "analytics";

// ---- Main page ----
export default function DoctorDashboardPage() {
  const { ready } = useAuthGuard("doctor");
  const { searches, addSearch } = useRecentSearches();
  const [activeTab, setActiveTab] = useState<Tab>("analytics");

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
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Search for patients and view their critical medical data.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "analytics"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "search"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("search")}
        >
          Emergency Search
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "analytics" ? (
        <AnalyticsTab />
      ) : (
        <EmergencySearchTab searches={searches} addSearch={addSearch} />
      )}
    </DashboardShell>
  );
}
