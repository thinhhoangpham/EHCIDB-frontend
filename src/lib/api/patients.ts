import apiClient from "./client";
import type {
  PatientProfile,
  Allergy,
  Condition,
  Medication,
  Device,
  EmergencyContact,
  InsuranceInfo,
} from "@/types/api";

// Profile
export const getMyProfile = () =>
  apiClient.get<PatientProfile>("/patients/me/").then((r) => r.data);

export const updateProfile = (data: Partial<PatientProfile>) =>
  apiClient.patch<PatientProfile>("/patients/me/", data).then((r) => r.data);

// Allergies
export const getAllergies = () =>
  apiClient.get<Allergy[]>("/patients/me/allergies/").then((r) => r.data);

export const addAllergy = (data: Omit<Allergy, "id">) =>
  apiClient.post<Allergy>("/patients/me/allergies/", data).then((r) => r.data);

export const deleteAllergy = (id: string) =>
  apiClient.delete(`/patients/me/allergies/${id}/`);

// Conditions
export const getConditions = () =>
  apiClient.get<Condition[]>("/patients/me/conditions/").then((r) => r.data);

export const addCondition = (data: Omit<Condition, "id">) =>
  apiClient.post<Condition>("/patients/me/conditions/", data).then((r) => r.data);

export const deleteCondition = (id: string) =>
  apiClient.delete(`/patients/me/conditions/${id}/`);

// Medications
export const getMedications = () =>
  apiClient.get<Medication[]>("/patients/me/medications/").then((r) => r.data);

export const addMedication = (data: Omit<Medication, "id">) =>
  apiClient.post<Medication>("/patients/me/medications/", data).then((r) => r.data);

export const deleteMedication = (id: string) =>
  apiClient.delete(`/patients/me/medications/${id}/`);

// Devices
export const getDevices = () =>
  apiClient.get<Device[]>("/patients/me/devices/").then((r) => r.data);

export const addDevice = (data: Omit<Device, "id">) =>
  apiClient.post<Device>("/patients/me/devices/", data).then((r) => r.data);

export const deleteDevice = (id: string) =>
  apiClient.delete(`/patients/me/devices/${id}/`);

// Emergency Contacts
export const getEmergencyContacts = () =>
  apiClient.get<EmergencyContact[]>("/patients/me/emergency-contacts/").then((r) => r.data);

export const addEmergencyContact = (data: Omit<EmergencyContact, "id">) =>
  apiClient.post<EmergencyContact>("/patients/me/emergency-contacts/", data).then((r) => r.data);

export const updateEmergencyContact = (id: string, data: Partial<EmergencyContact>) =>
  apiClient.patch<EmergencyContact>(`/patients/me/emergency-contacts/${id}/`, data).then((r) => r.data);

export const deleteEmergencyContact = (id: string) =>
  apiClient.delete(`/patients/me/emergency-contacts/${id}/`);

// Insurance
export const getInsurance = () =>
  apiClient.get<InsuranceInfo>("/patients/me/insurance/").then((r) => r.data);

export const updateInsurance = (data: Partial<InsuranceInfo>) =>
  apiClient.patch<InsuranceInfo>("/patients/me/insurance/", data).then((r) => r.data);
