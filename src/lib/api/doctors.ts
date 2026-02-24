import apiClient from "./client";
import type { PatientProfile, Allergy, Condition, Medication, Device, EmergencyContact, InsuranceInfo } from "@/types/api";

export interface PatientEmergencyData {
  profile: PatientProfile;
  allergies: Allergy[];
  conditions: Condition[];
  medications: Medication[];
  devices: Device[];
  emergency_contacts: EmergencyContact[];
  insurance: InsuranceInfo | null;
}

export const getPatientByEmergencyId = (emergencyId: string) =>
  apiClient
    .get<PatientEmergencyData>(`/patients/emergency/${emergencyId}/`)
    .then((r) => r.data);
