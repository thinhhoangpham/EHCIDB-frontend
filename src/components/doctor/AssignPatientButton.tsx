// "use client";

// import { useState } from "react";
// import { assignPatient } from "@/lib/api/admission";

// export default function AssignPatientButton({
//   patientId,
// }: {
//   patientId: number;
// }) {
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState("");

//   const handleAssign = async () => {
//     setLoading(true);
//     setError("");
//     setSuccess(false);

//     try {
//       await assignPatient(patientId);
//       setSuccess(true);
//     } catch (err: any) {
//       setError(err?.response?.data?.detail || "Failed to assign patient");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={handleAssign}
//         disabled={loading}
//         className="px-3 py-2 bg-blue-600 text-white rounded"
//       >
//         {loading ? "Assigning..." : "Assign Patient"}
//       </button>

//       {success && (
//         <p className="text-green-600 mt-2">Patient assigned successfully</p>
//       )}

//       {error && <p className="text-red-600 mt-2">{error}</p>}
//     </div>
//   );
// }