// const [assignedPatients, setAssignedPatients] = useState<any[]>([]);
// const [loadingAssigned, setLoadingAssigned] = useState(false);
// useEffect(() => {
//   const load = async () => {
//     try {
//       setLoadingAssigned(true);
//       const data = await getAssignedPatients();
//       setAssignedPatients(data);
//     } catch (err) {
//       console.error("Failed to load assignments", err);
//     } finally {
//       setLoadingAssigned(false);
//     }
//   };

//   load();
// }, []);