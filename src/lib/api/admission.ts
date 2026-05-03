import axios from "./client";

export const assignPatient = async (patient_id: number) => {
  return axios.post(`/admission/assign`, null, {
    params: {
      patient_id,
    },
  });
};

// export const getAssignedPatients = async () => {
//   const res = await axios.get("/api/admission/assigned");
//   return res.data;
// };