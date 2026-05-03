"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  X,
  AlertTriangle,
  Shield,
  Heart,
  Pill,
  Smartphone,
  Users,
  FileText,
  Activity,
  DollarSign,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { useAuthGuard } from "@/hooks/useAuthGuard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";
import {
  getPatientProfile,
  addAllergy,
  deleteAllergy,
  addCondition,
  deleteCondition,
  addMedication,
  deleteMedication,
  addDevice,
  deleteDevice,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  updatePatientInfo,
  updatePatientInsurance,
  getPatientInsuranceProviders,
} from "@/lib/api/emergency";
import type { PatientProfile, EmergencyContactInfo } from "@/lib/api/emergency";
import { getPatientDashboard } from "@/lib/api/dashboard";
import type { PatientDashboard } from "@/lib/api/dashboard";

// ---- Helpers ----
function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
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
        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
        styles[severity] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {severity}
    </span>
  );
}

// ---- Critical badge ----
function CriticalBadge({ critical }: { critical: boolean }) {
  return critical ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
      <AlertTriangle className="h-3 w-3" />
      Critical
    </span>
  ) : (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
      Non-critical
    </span>
  );
}

// ---- Section card wrapper ----
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-blue-500">{icon}</span>
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ---- Inline add form ----
type FieldDef =
  | { name: string; label: string; type?: "text"; placeholder?: string }
  | { name: string; label: string; type: "severity-select" }
  | { name: string; label: string; type: "boolean-select" };

interface AddFormProps {
  fields: FieldDef[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function AddForm({ fields, onSubmit, onCancel, submitLabel = "Add" }: AddFormProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, ""]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-gray-100 pt-3">
      {fields.map((f) => (
        <div key={f.name}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
          {f.type === "severity-select" ? (
            <select
              value={values[f.name]}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select severity...</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
            </select>
          ) : f.type === "boolean-select" ? (
            <select
              value={values[f.name]}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select...</option>
              <option value="false">No</option>
              <option value="true">Yes — Critical</option>
            </select>
          ) : (
            <input
              type="text"
              value={values[f.name]}
              placeholder={"placeholder" in f ? f.placeholder : undefined}
              onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting} className="text-xs px-3 py-1.5 h-auto">
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-xs px-3 py-1.5 h-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---- Contact edit form ----
interface ContactFormProps {
  initial?: EmergencyContactInfo;
  onSubmit: (values: { contact_name: string; relationship: string; phone_number: string }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

function ContactForm({ initial, onSubmit, onCancel, submitLabel = "Save" }: ContactFormProps) {
  const [values, setValues] = useState({
    contact_name: initial?.contact_name ?? "",
    relationship: initial?.relationship ?? "",
    phone_number: initial?.phone_number ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-gray-100 pt-3">
      {[
        { name: "contact_name" as const, label: "Name", placeholder: "Full name" },
        { name: "relationship" as const, label: "Relationship", placeholder: "e.g. Spouse" },
        { name: "phone_number" as const, label: "Phone", placeholder: "e.g. 555-0001" },
      ].map((f) => (
        <div key={f.name}>
          <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
          <input
            type="text"
            value={values[f.name]}
            placeholder={f.placeholder}
            onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      ))}
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting} className="text-xs px-3 py-1.5 h-auto">
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-xs px-3 py-1.5 h-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---- Delete button ----
function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:opacity-40"
      aria-label="Delete"
    >
      {busy ? <Spinner size="sm" /> : <X className="h-3.5 w-3.5" />}
    </button>
  );
}

// ---- Insurance edit form ----
interface InsuranceFormProps {
  initial?: { provider_name: string; plan_type: string; member_id: string; coverage_status: string };
  onSubmit: (values: { provider_name: string; plan_type: string; member_id: string; coverage_status: string }) => Promise<void>;
  onCancel: () => void;
}

function InsuranceForm({ initial, onSubmit, onCancel }: InsuranceFormProps) {
  const [providers, setProviders] = useState<{ provider_id: number; provider_name: string }[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    getPatientInsuranceProviders()
      .then(setProviders)
      .catch(console.error)
      .finally(() => setLoadingProviders(false));
  }, []);

  const [values, setValues] = useState({
    provider_name: initial?.provider_name ?? "",
    plan_type: initial?.plan_type ?? "",
    member_id: initial?.member_id ?? "",
    coverage_status: initial?.coverage_status ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation
    if (!values.provider_name.trim()) {
      setError("Provider name is required");
      return;
    }
    if (!values.plan_type.trim()) {
      setError("Plan type is required");
      return;
    }
    if (!values.member_id.trim()) {
      setError("Member ID is required");
      return;
    }
    if (!values.coverage_status.trim()) {
      setError("Coverage status is required");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Integrate with backend API for insurance updates
      // For now, this is frontend-only validation and UI
      await onSubmit(values);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save insurance information");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-gray-100 pt-3">
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Provider Name</label>
          <select
            value={values.provider_name}
            onChange={(e) => setValues((v) => ({ ...v, provider_name: e.target.value }))}
            required
            disabled={loadingProviders}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">{loadingProviders ? "Loading providers..." : "Select provider..."}</option>
            {providers.map((p) => (
              <option key={p.provider_id} value={p.provider_name}>
                {p.provider_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Plan Type</label>
          <select
            value={values.plan_type}
            onChange={(e) => setValues((v) => ({ ...v, plan_type: e.target.value }))}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select plan type...</option>
            <option value="PPO">PPO</option>
            <option value="HMO">HMO</option>
            <option value="Medicaid">Medicaid</option>
            <option value="Medicare">Medicare</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Member ID</label>
          <input
            type="text"
            value={values.member_id}
            placeholder="e.g. ABC123456789"
            onChange={(e) => setValues((v) => ({ ...v, member_id: e.target.value }))}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Coverage Status</label>
          <select
            value={values.coverage_status}
            onChange={(e) => setValues((v) => ({ ...v, coverage_status: e.target.value }))}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500"
          >
            <option value="">Select status...</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" loading={submitting} className="text-xs px-3 py-1.5 h-auto">
          Save Insurance
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-xs px-3 py-1.5 h-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---- Admission type badge ----
function AdmissionTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Emergency: "bg-red-100 text-red-800",
    Urgent: "bg-yellow-100 text-yellow-800",
    Elective: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
        styles[type] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {type}
    </span>
  );
}

// ---- Test result badge ----
function TestResultBadge({ result }: { result: string }) {
  const styles: Record<string, string> = {
    Normal: "bg-green-100 text-green-800",
    Abnormal: "bg-red-100 text-red-800",
    Inconclusive: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
        styles[result] ?? "bg-gray-100 text-gray-700"
      )}
    >
      {result}
    </span>
  );
}

// ---- Patient Info edit form ----
interface PatientInfoFormProps {
  initial: { phone_number: string | null; address: string | null };
  onSubmit: (values: { phone_number: string | null; address: string | null }) => Promise<void>;
  onCancel: () => void;
}

function PatientInfoForm({ initial, onSubmit, onCancel }: PatientInfoFormProps) {
  const [values, setValues] = useState({
    phone_number: initial.phone_number ?? "",
    address: initial.address ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        phone_number: values.phone_number.trim() || null,
        address: values.address.trim() || null,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save info");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 border-b border-gray-100 bg-gray-50/50">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
          <input
            type="text"
            value={values.phone_number}
            placeholder="e.g. 555-1234"
            onChange={(e) => setValues((v) => ({ ...v, phone_number: e.target.value }))}
            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
          <input
            type="text"
            value={values.address}
            placeholder="e.g. 123 Main St"
            onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center gap-2 pt-2">
          <Button type="submit" loading={submitting} className="text-xs px-3 py-1.5 h-auto">
            Save
          </Button>
          <Button type="button" variant="ghost" className="text-xs px-3 py-1.5 h-auto" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

// ---- Emergency Info Tab ----
interface EmergencyInfoTabProps {
  profile: PatientProfile;
  onRefresh: () => Promise<void>;
}

function EmergencyInfoTab({ profile, onRefresh }: EmergencyInfoTabProps) {
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [editingInsurance, setEditingInsurance] = useState(false);
  const [editingPatientInfo, setEditingPatientInfo] = useState(false);

  return (
    <>
      {/* Emergency info table */}
      <div className="mb-6 rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Emergency Information
          </h3>
          {!editingPatientInfo && (
            <button
              onClick={() => setEditingPatientInfo(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit Info
            </button>
          )}
        </div>
        {editingPatientInfo ? (
          <PatientInfoForm
            initial={{ phone_number: profile.phone_number, address: profile.address }}
            onSubmit={async (values) => {
              await updatePatientInfo(values);
              setEditingPatientInfo(false);
              await onRefresh();
            }}
            onCancel={() => setEditingPatientInfo(false)}
          />
        ) : (
          <table className="w-full text-sm">
          <tbody>
            {[
              { label: "Emergency ID", value: profile.emergency_identifier },
              { label: "Blood Type", value: profile.blood_type },
              { label: "Gender", value: profile.gender },
              { label: "Date of Birth", value: profile.date_of_birth ?? "—" },
              { label: "Phone", value: profile.phone_number ?? "—" },
              { label: "Email", value: profile.email ?? "—" },
              { label: "Address", value: profile.address ?? "—" },
            ].map((row, i) => (
              <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-5 py-3 font-medium text-gray-600 w-40">{row.label}</td>
                <td className="px-5 py-3 text-gray-900 font-semibold">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Two-column grid for sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Allergies */}
        <SectionCard title="Allergies" icon={<Shield className="h-4 w-4" />}>
          <ul className="space-y-2">
            {profile.allergies.length === 0 && (
              <li className="text-sm text-gray-400">No allergies recorded</li>
            )}
            {profile.allergies.map((a) => (
              <li key={a.allergy_id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-800 flex-1">{a.allergy_name}</span>
                <SeverityBadge severity={a.severity} />
                <DeleteButton
                  onDelete={async () => {
                    await deleteAllergy(a.allergy_id);
                    await onRefresh();
                  }}
                />
              </li>
            ))}
          </ul>
          {showAddAllergy ? (
            <AddForm
              fields={[
                { name: "allergy_name", label: "Allergy Name", placeholder: "e.g. Penicillin" },
                { name: "severity", label: "Severity", type: "severity-select" },
              ]}
              onSubmit={async (v) => {
                await addAllergy({ allergy_name: v.allergy_name, severity: v.severity });
                setShowAddAllergy(false);
                await onRefresh();
              }}
              onCancel={() => setShowAddAllergy(false)}
              submitLabel="Add Allergy"
            />
          ) : (
            <button
              onClick={() => setShowAddAllergy(true)}
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Allergy
            </button>
          )}
        </SectionCard>

        {/* Medical Conditions */}
        <SectionCard title="Medical Conditions" icon={<Heart className="h-4 w-4" />}>
          <ul className="space-y-2">
            {profile.conditions.length === 0 && (
              <li className="text-sm text-gray-400">No conditions recorded</li>
            )}
            {profile.conditions.map((c) => (
              <li key={c.condition_id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-800 flex-1">{c.condition_name}</span>
                <CriticalBadge critical={c.critical_flag} />
                <DeleteButton
                  onDelete={async () => {
                    await deleteCondition(c.condition_id);
                    await onRefresh();
                  }}
                />
              </li>
            ))}
          </ul>
          {showAddCondition ? (
            <AddForm
              fields={[
                {
                  name: "condition_name",
                  label: "Condition Name",
                  placeholder: "e.g. Diabetes",
                },
                {
                  name: "critical_flag",
                  label: "Critical?",
                  type: "boolean-select",
                },
              ]}
              onSubmit={async (v) => {
                await addCondition({
                  condition_name: v.condition_name,
                  critical_flag: v.critical_flag === "true",
                });
                setShowAddCondition(false);
                await onRefresh();
              }}
              onCancel={() => setShowAddCondition(false)}
              submitLabel="Add Condition"
            />
          ) : (
            <button
              onClick={() => setShowAddCondition(true)}
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Condition
            </button>
          )}
        </SectionCard>

        {/* Medications */}
        <SectionCard title="Medications" icon={<Pill className="h-4 w-4" />}>
          <ul className="space-y-2">
            {profile.medications.length === 0 && (
              <li className="text-sm text-gray-400">No medications recorded</li>
            )}
            {profile.medications.map((m) => (
              <li key={m.medication_id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-800 flex-1">
                  {m.medication_name}{" "}
                  <span className="text-gray-500 text-xs">{m.dosage}</span>
                </span>
                <DeleteButton
                  onDelete={async () => {
                    await deleteMedication(m.medication_id);
                    await onRefresh();
                  }}
                />
              </li>
            ))}
          </ul>
          {showAddMedication ? (
            <AddForm
              fields={[
                {
                  name: "medication_name",
                  label: "Medication Name",
                  placeholder: "e.g. Metformin",
                },
                { name: "dosage", label: "Dosage", placeholder: "e.g. 500mg" },
              ]}
              onSubmit={async (v) => {
                await addMedication({ medication_name: v.medication_name, dosage: v.dosage });
                setShowAddMedication(false);
                await onRefresh();
              }}
              onCancel={() => setShowAddMedication(false)}
              submitLabel="Add Medication"
            />
          ) : (
            <button
              onClick={() => setShowAddMedication(true)}
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Medication
            </button>
          )}
        </SectionCard>

        {/* Devices */}
        <SectionCard title="Medical Devices" icon={<Smartphone className="h-4 w-4" />}>
          <ul className="space-y-2">
            {profile.devices.length === 0 && (
              <li className="text-sm text-gray-400">No devices recorded</li>
            )}
            {profile.devices.map((d) => (
              <li key={d.device_id} className="flex items-center justify-between gap-2">
                <span className="text-sm text-gray-800 flex-1">
                  {d.device_name}{" "}
                  <span className="text-gray-500 text-xs">/ {d.device_type}</span>
                </span>
                <DeleteButton
                  onDelete={async () => {
                    await deleteDevice(d.device_id);
                    await onRefresh();
                  }}
                />
              </li>
            ))}
          </ul>
          {showAddDevice ? (
            <AddForm
              fields={[
                { name: "device_name", label: "Device Name", placeholder: "e.g. Pacemaker" },
                { name: "device_type", label: "Device Type", placeholder: "e.g. Cardiac" },
              ]}
              onSubmit={async (v) => {
                await addDevice({ device_name: v.device_name, device_type: v.device_type });
                setShowAddDevice(false);
                await onRefresh();
              }}
              onCancel={() => setShowAddDevice(false)}
              submitLabel="Add Device"
            />
          ) : (
            <button
              onClick={() => setShowAddDevice(true)}
              className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Device
            </button>
          )}
        </SectionCard>
      </div>

      {/* Emergency Contacts — full width */}
      <div className="mb-6">
        <SectionCard title="Emergency Contacts" icon={<Users className="h-4 w-4" />}>
          <div className="space-y-3">
            {profile.emergency_contacts.length === 0 && (
              <p className="text-sm text-gray-400">No emergency contacts recorded</p>
            )}
            {profile.emergency_contacts.map((c) =>
              editingContactId === c.contact_id ? (
                <div key={c.contact_id} className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <ContactForm
                    initial={c}
                    onSubmit={async (values) => {
                      await updateEmergencyContact(c.contact_id, values);
                      setEditingContactId(null);
                      await onRefresh();
                    }}
                    onCancel={() => setEditingContactId(null)}
                    submitLabel="Save Contact"
                  />
                </div>
              ) : (
                <div
                  key={c.contact_id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-4 py-2.5"
                >
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">{c.contact_name}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-600">{c.relationship}</span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-600">{c.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingContactId(c.contact_id)}
                      className="rounded px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                    <DeleteButton
                      onDelete={async () => {
                        await deleteEmergencyContact(c.contact_id);
                        await onRefresh();
                      }}
                    />
                  </div>
                </div>
              )
            )}

            {showAddContact ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <ContactForm
                  onSubmit={async (values) => {
                    await addEmergencyContact(values);
                    setShowAddContact(false);
                    await onRefresh();
                  }}
                  onCancel={() => setShowAddContact(false)}
                  submitLabel="Add Contact"
                />
              </div>
            ) : (
              <button
                onClick={() => setShowAddContact(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Contact
              </button>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Insurance */}
      <SectionCard title="Insurance" icon={<FileText className="h-4 w-4" />}>
        {editingInsurance ? (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <InsuranceForm
              initial={profile.insurance ?? undefined}
              onSubmit={async (values) => {
                await updatePatientInsurance({
                  provider_name: values.provider_name.trim(),
                  plan_type: values.plan_type as "PPO" | "HMO" | "Medicaid" | "Medicare",
                  member_id: values.member_id.trim(),
                  coverage_status: values.coverage_status as "Active" | "Inactive",
                });
                setEditingInsurance(false);
                await onRefresh();
              }}
              onCancel={() => setEditingInsurance(false)}
            />
          </div>
        ) : profile.insurance === null ? (
          <div>
            <p className="text-sm text-gray-400">No insurance information on file</p>
            <Button
              onClick={() => setEditingInsurance(true)}
              variant="ghost"
              className="mt-2 text-xs px-2 py-1 h-auto"
            >
              Add Insurance
            </Button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm mb-3">
              {[
                { label: "Provider", value: profile.insurance.provider_name },
                { label: "Plan", value: profile.insurance.plan_type },
                { label: "Member ID", value: profile.insurance.member_id },
                { label: "Status", value: profile.insurance.coverage_status },
              ].map((row) => (
                <div key={row.label} className="flex items-baseline gap-2">
                  <span className="text-gray-500 w-24 flex-shrink-0">{row.label}:</span>
                  <span className="font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setEditingInsurance(true)}
              variant="ghost"
              className="text-xs px-2 py-1 h-auto"
            >
              Edit Insurance
            </Button>
          </div>
        )}
      </SectionCard>
    </>
  );
}

// ---- Analytics Tab ----
const BADGE_COLORS = [
  "bg-blue-100 text-blue-800",
  "bg-purple-100 text-purple-800",
  "bg-green-100 text-green-800",
  "bg-yellow-100 text-yellow-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
];

const TEST_RESULT_COLORS: Record<string, string> = {
  Normal: "#22c55e",
  Abnormal: "#ef4444",
  Inconclusive: "#f59e0b",
};

function AnalyticsTab() {
  const [data, setData] = useState<PatientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getPatientDashboard()
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load analytics");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
        Failed to load analytics: {error}
      </div>
    );
  }

  if (!data) return null;

  const totalBilled = data.billing_summary.total_billed;
  const billingByInsurance = data.billing_summary.by_insurance.map((b) => ({
    name: b.provider,
    value: b.total,
  }));

  const testResultData = data.test_results.map((t) => ({
    name: t.result,
    value: t.count,
  }));

  // Generate distinct colors for insurance pie slices
  const insuranceColors = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316",
  ];

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {data.profile.patient_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-gray-900">{data.profile.patient_name}</p>
            <div className="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Gender: <span className="font-medium text-gray-700">{data.profile.gender}</span></span>
              <span>Blood Type: <span className="font-medium text-gray-700">{data.profile.blood_type}</span></span>
              <span>Total Admissions: <span className="font-medium text-gray-700">{data.profile.total_admissions.toLocaleString()}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Admissions"
          value={data.profile.total_admissions.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Total Billed"
          value={formatCurrency(totalBilled)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Distinct Conditions"
          value={data.conditions.length.toLocaleString()}
          icon={<Heart className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Billing by Insurance */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Billing by Insurance</h3>
          {billingByInsurance.length === 0 ? (
            <p className="text-sm text-gray-400">No billing data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={billingByInsurance}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                >
                  {billingByInsurance.map((_, index) => (
                    <Cell
                      key={`billing-cell-${index}`}
                      fill={insuranceColors[index % insuranceColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Test Results */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Test Results</h3>
          {testResultData.length === 0 ? (
            <p className="text-sm text-gray-400">No test result data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={testResultData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                >
                  {testResultData.map((entry, index) => (
                    <Cell
                      key={`test-cell-${index}`}
                      fill={TEST_RESULT_COLORS[entry.name] ?? "#9ca3af"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* My Doctors */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">My Doctors</h3>
          {data.doctors.length === 0 ? (
            <p className="text-sm text-gray-400">No doctors on record</p>
          ) : (
            <ul className="space-y-1.5">
              {data.doctors.map((d) => (
                <li key={d.doctor_id} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {d.doctor_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* My Conditions */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">My Conditions</h3>
          {data.conditions.length === 0 ? (
            <p className="text-sm text-gray-400">No conditions on record</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.conditions.map((c, i) => (
                <span
                  key={c}
                  className={cn(
                    "inline-block rounded-full px-2.5 py-1 text-xs font-medium",
                    BADGE_COLORS[i % BADGE_COLORS.length]
                  )}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* My Medications */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">My Medications</h3>
          {data.medications.length === 0 ? (
            <p className="text-sm text-gray-400">No medications on record</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.medications.map((m, i) => (
                <span
                  key={m}
                  className={cn(
                    "inline-block rounded-full px-2.5 py-1 text-xs font-medium",
                    BADGE_COLORS[i % BADGE_COLORS.length]
                  )}
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admission History table */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
            Admission History
          </h3>
        </div>
        {data.admissions.length === 0 ? (
          <p className="p-5 text-sm text-gray-400">No admission history</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Date", "Doctor", "Hospital", "Condition", "Type", "Medication", "Test Result", "Billing"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.admissions.map((a, i) => (
                  <tr key={a.admission_id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{a.date_of_admission}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{a.doctor_name}</td>
                    <td className="px-4 py-3 text-gray-700">{a.hospital_name}</td>
                    <td className="px-4 py-3 text-gray-700">{a.medical_condition}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <AdmissionTypeBadge type={a.admission_type} />
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.medication}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TestResultBadge result={a.test_result} />
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-medium">
                      {formatCurrency(a.billing_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main page ----
type Tab = "emergency" | "analytics";

export default function PatientDashboardPage() {
  const { ready } = useAuthGuard("patient");
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("analytics");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getPatientProfile();
      setProfile(data);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (ready) fetchProfile();
  }, [ready, fetchProfile]);

  if (!ready || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <DashboardShell>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          Failed to load profile: {fetchError}
        </div>
      </DashboardShell>
    );
  }

  if (!profile) return null;

  return (
    <DashboardShell>
      {/* Page header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome, {profile.patient_name}. Update your emergency medical profile to keep doctors
          informed in emergencies.
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
            activeTab === "emergency"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("emergency")}
        >
          Emergency Info
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "analytics" ? (
        <AnalyticsTab />
      ) : (
        <EmergencyInfoTab profile={profile} onRefresh={fetchProfile} />
      )}
    </DashboardShell>
  );
}
