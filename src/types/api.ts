// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

// ─── Patient Profile ─────────────────────────────────────────────────────────

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface PatientProfile {
  id: string;
  emergency_id: string;
  name: string;
  date_of_birth: string;
  blood_type: BloodType;
}

// ─── Medical Records ─────────────────────────────────────────────────────────

export type Severity = 'mild' | 'moderate' | 'severe';
export interface Allergy {
  id: string;
  name: string;
  severity: Severity;
  critical_flag: boolean;
  notes?: string;
}

export interface Condition {
  id: string;
  name: string;
  severity: Severity;
  critical_flag: boolean;
  notes?: string;
}
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface Device {
  id: string;
  name: string;
  description?: string;
  implanted_date?: string;
  notes?: string;
}

// ─── Emergency Contact ───────────────────────────────────────────────────────

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

// ─── Insurance ───────────────────────────────────────────────────────────────

export type CoverageStatus = "active" | "inactive" | "pending";

export interface InsuranceInfo {
  id: string;
  provider_name: string;
  policy_number: string;
  coverage_status: CoverageStatus;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AccessLog {
  id: string;
  timestamp: string;
  user_name: string;
  action: string;
  target_patient_id?: string;
}
