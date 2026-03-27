import apiClient from "./client";

export interface AdminDashboard {
  stats: {
    total_patients: number;
    total_admissions: number;
    total_doctors: number;
    avg_billing: number;
    avg_length_of_stay: number;
  };
  admissions_over_time: { month: string; count: number }[];
  admissions_by_type: { type: string; count: number }[];
  top_conditions: { condition: string; count: number }[];
  billing_by_insurance: { provider: string; total: number }[];
  demographics: {
    gender: { gender: string; count: number }[];
    age_groups: { group: string; count: number }[];
  };
  test_results: { result: string; count: number }[];
  medication_usage: { medication: string; count: number }[];
  recent_admissions: {
    admission_id: number;
    patient_name: string;
    doctor_name: string;
    hospital_name: string;
    medical_condition: string;
    admission_type: string;
    date_of_admission: string;
    discharge_date: string;
    billing_amount: number;
  }[];
}

export interface DoctorDashboard {
  stats: {
    my_patients: number;
    total_admissions: number;
    avg_billing: number;
    avg_length_of_stay: number;
  };
  patients: { patient_id: number; patient_name: string; gender: string; blood_type: string }[];
  admissions_over_time: { month: string; count: number }[];
  conditions_breakdown: { condition: string; count: number }[];
  test_results: { result: string; count: number }[];
  recent_admissions: {
    admission_id: number;
    patient_name: string;
    hospital_name: string;
    medical_condition: string;
    admission_type: string;
    medication: string;
    test_result: string;
    date_of_admission: string;
    discharge_date: string;
    billing_amount: number;
  }[];
}

export interface PatientDashboard {
  profile: {
    patient_name: string;
    gender: string;
    blood_type: string;
    total_admissions: number;
  };
  admissions: {
    admission_id: number;
    doctor_name: string;
    hospital_name: string;
    medical_condition: string;
    admission_type: string;
    medication: string;
    test_result: string;
    date_of_admission: string;
    discharge_date: string;
    billing_amount: number;
    age_at_admission: number;
    room_number: number;
  }[];
  doctors: { doctor_id: number; doctor_name: string }[];
  conditions: string[];
  medications: string[];
  billing_summary: {
    total_billed: number;
    by_insurance: { provider: string; total: number }[];
  };
  test_results: { result: string; count: number }[];
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const res = await apiClient.get<AdminDashboard>("/dashboard/admin");
  return res.data;
}

export async function getDoctorDashboard(): Promise<DoctorDashboard> {
  const res = await apiClient.get<DoctorDashboard>("/dashboard/doctor");
  return res.data;
}

export async function getPatientDashboard(): Promise<PatientDashboard> {
  const res = await apiClient.get<PatientDashboard>("/dashboard/patient");
  return res.data;
}
