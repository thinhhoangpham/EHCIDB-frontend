import apiClient from "./client";

// ---- Types ----
export interface Allergy {
  allergy_id: number;
  allergy_name: string;
  severity: "Mild" | "Moderate" | "Severe";
}

export interface Condition {
  condition_id: number;
  condition_name: string;
  critical_flag: boolean;
}

export interface Medication {
  medication_id: number;
  medication_name: string;
  dosage: string;
}

export interface Device {
  device_id: number;
  device_name: string;
  device_type: string;
}

export interface EmergencyContactInfo {
  contact_id: number;
  contact_name: string;
  relationship: string;
  phone_number: string;
}

export interface InsuranceInfo {
  provider_name: string;
  plan_type: string;
  member_id: string;
  coverage_status: string;
}

export interface PatientProfile {
  emergency_identifier: string;
  patient_name: string;
  gender: string;
  blood_type: string;
  date_of_birth: string | null;
  phone_number: string | null;
  email: string | null;
  address: string | null;
  allergies: Allergy[];
  conditions: Condition[];
  medications: Medication[];
  devices: Device[];
  emergency_contacts: EmergencyContactInfo[];
  insurance: InsuranceInfo | null;
}

export interface PatientSearchResult {
  patient_id: number;
  emergency_identifier: string;
  patient_name: string;
  blood_type: string;
}

export interface UserEntry {
  user_id: number;
  username: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface AccessLogEntry {
  log_id: number;
  user_name: string;
  action: string;
  target_patient_name: string | null;
  created_at: string;
}

export interface InsuranceProvider {
  provider_id: number;
  provider_name: string;
  payer_phone: string;
}

// ---- Patient APIs ----
export const getPatientProfile = () =>
  apiClient.get<PatientProfile>("/emergency/patient/profile").then((r) => r.data);

export const updatePatientInfo = (data: { phone_number: string | null; address: string | null }) =>
  apiClient.put<PatientProfile>("/emergency/patient/profile/info", data).then((r) => r.data);

export const addAllergy = (data: { allergy_name: string; severity: string }) =>
  apiClient.post("/emergency/patient/allergies", data);

export const deleteAllergy = (id: number) =>
  apiClient.delete(`/emergency/patient/allergies/${id}`);

export const addCondition = (data: { condition_name: string; critical_flag: boolean }) =>
  apiClient.post("/emergency/patient/conditions", data);

export const deleteCondition = (id: number) =>
  apiClient.delete(`/emergency/patient/conditions/${id}`);

export const addMedication = (data: { medication_name: string; dosage: string }) =>
  apiClient.post("/emergency/patient/medications", data);

export const deleteMedication = (id: number) =>
  apiClient.delete(`/emergency/patient/medications/${id}`);

export const addDevice = (data: { device_name: string; device_type: string }) =>
  apiClient.post("/emergency/patient/devices", data);

export const deleteDevice = (id: number) =>
  apiClient.delete(`/emergency/patient/devices/${id}`);

export const addEmergencyContact = (data: {
  contact_name: string;
  relationship: string;
  phone_number: string;
}) => apiClient.post("/emergency/patient/emergency-contacts", data);

export const updateEmergencyContact = (
  id: number,
  data: { contact_name: string; relationship: string; phone_number: string }
) => apiClient.put(`/emergency/patient/emergency-contacts/${id}`, data);

export const deleteEmergencyContact = (id: number) =>
  apiClient.delete(`/emergency/patient/emergency-contacts/${id}`);

// ---- Doctor APIs ----
export const searchPatients = (q: string) =>
  apiClient
    .get<PatientSearchResult[]>("/emergency/doctor/search", { params: { q } })
    .then((r) => r.data);

export const getPatientEmergencyCard = (emergencyId: string) =>
  apiClient
    .get<PatientProfile>(`/emergency/doctor/patient/${emergencyId}`)
    .then((r) => r.data);

// ---- Admin APIs ----
export const getUsers = (page: number, limit: number) =>
  apiClient
    .get<{ users: UserEntry[]; total: number }>("/emergency/admin/users", {
      params: { page, limit },
    })
    .then((r) => r.data);

export const updateUser = (userId: number, data: { is_active?: boolean; role?: string }) =>
  apiClient.patch(`/emergency/admin/users/${userId}`, data);

export const getAccessLogs = (page: number, limit: number) =>
  apiClient
    .get<{ logs: AccessLogEntry[]; total: number }>("/emergency/admin/access-logs", {
      params: { page, limit },
    })
    .then((r) => r.data);

export const getInsuranceProviders = () =>
  apiClient
    .get<InsuranceProvider[]>("/emergency/admin/insurance-providers")
    .then((r) => r.data);

export const addInsuranceProvider = (data: { provider_name: string; payer_phone: string }) =>
  apiClient.post("/emergency/admin/insurance-providers", data);

export const deleteInsuranceProvider = (id: number) =>
  apiClient.delete(`/emergency/admin/insurance-providers/${id}`);
