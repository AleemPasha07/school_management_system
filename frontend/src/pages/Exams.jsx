import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const [form, setForm] = useState({ subject_id: "", date: "" });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exams");
      setExams(Array.isArray(res.data) ? res.data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchExams(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(isAdmin || isTeacher)) return;
    await api.post("/exams", { ...form, subject_id: Number(form.subject_id) });
    toastSuccess("Exam added");
    setForm({ subject_id: "", date: "" });
    fetchExams();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this exam?")) return;
    await api.delete(`/exams/${id}`);
    toastSuccess("Exam deleted");
    fetchExams();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Exams</h1>

      {(isAdmin || isTeacher) && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 500 }}>
          <FetchSelect endpoint="/subjects" valueKey="subject_id" labelKey="subject_name" value={form.subject_id} onChange={(v) => setForm({ ...form, subject_id: v })} placeholder="Select Subject" />
          <input className="form-control" type="date" name="date" value={form.date} onChange={handleChange} required />
          <button type="submit" className="btn btn-primary">➕ Add Exam</button>
        </form>
      )}

      {loading ? <Loading label="Loading exams..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Subject</th><th>Subject ID</th><th>Date</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {exams.length === 0 ? <tr><td colSpan={isAdmin ? 5 : 4}>No records</td></tr> : exams.map(e => (
              <tr key={e.exam_id}>
                <td>{e.exam_id}</td><td>{e.subject_name || "-"}</td><td>{e.subject_id}</td><td>{e.date ? String(e.date).slice(0, 10) : "-"}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(e.exam_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Exams;