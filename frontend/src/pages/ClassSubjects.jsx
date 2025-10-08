import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function ClassSubjects() {
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({ class_id: "", subject_id: "" });

  const fetchMappings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/class-subjects");
      setMappings(Array.isArray(res.data) ? res.data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMappings(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    await api.post("/class-subjects", { class_id: Number(form.class_id), subject_id: Number(form.subject_id) });
    toastSuccess("Mapping added");
    setForm({ class_id: "", subject_id: "" });
    fetchMappings();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this mapping?")) return;
    await api.delete(`/class-subjects/${id}`);
    toastSuccess("Mapping deleted");
    fetchMappings();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Class-Subject Mappings</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 600 }}>
          <FetchSelect endpoint="/classes" valueKey="class_id" labelKey="class_name" value={form.class_id} onChange={(v) => setForm({ ...form, class_id: v })} placeholder="Select Class" />
          <FetchSelect endpoint="/subjects" valueKey="subject_id" labelKey="subject_name" value={form.subject_id} onChange={(v) => setForm({ ...form, subject_id: v })} placeholder="Select Subject" />
          <button type="submit" className="btn btn-primary">➕ Assign</button>
        </form>
      )}

      {loading ? <Loading label="Loading mappings..." /> : (
        <table className="table table-striped">
          <thead><tr><th>Mapping ID</th><th>Class ID</th><th>Subject ID</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {mappings.length === 0 ? <tr><td colSpan={isAdmin ? 4 : 3}>No records</td></tr> : mappings.map(m => (
              <tr key={m.class_subject_id}>
                <td>{m.class_subject_id}</td><td>{m.class_id}</td><td>{m.subject_id}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.class_subject_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default ClassSubjects;