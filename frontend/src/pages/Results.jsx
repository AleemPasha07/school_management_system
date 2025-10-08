import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const [form, setForm] = useState({ student_id: "", exam_id: "", marks: "", grade: "" });

  const fetchResults = async () => {
    try {
      setLoading(true);
      if (isStudent && user?.student_id) {
        const r = await api.get(`/results/${user.student_id}`);
        setResults(Array.isArray(r.data) ? r.data : []);
      } else if (isAdmin) {
        const r = await api.get("/results");
        setResults(Array.isArray(r.data) ? r.data : []);
      } else {
        // teacher: backend may not allow GET all; keep empty or adjust route to allow teacher too
        setResults([]);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchResults();  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(isAdmin || isTeacher)) return;
    await api.post("/results", { ...form, student_id: Number(form.student_id), exam_id: Number(form.exam_id), marks: Number(form.marks) });
    toastSuccess("Result added");
    setForm({ student_id: "", exam_id: "", marks: "", grade: "" });
    fetchResults();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this result?")) return;
    await api.delete(`/results/${id}`);
    toastSuccess("Result deleted");
    fetchResults();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Results</h1>

      {(isAdmin || isTeacher) && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 600 }}>
          <FetchSelect endpoint="/students" valueKey="student_id" labelKey="student_name" value={form.student_id} onChange={(v) => setForm({ ...form, student_id: v })} placeholder="Select Student" />
          <FetchSelect endpoint="/exams" valueKey="exam_id" labelKey="exam_id" value={form.exam_id} onChange={(v) => setForm({ ...form, exam_id: v })} placeholder="Select Exam" />
          <input className="form-control" type="number" name="marks" placeholder="Marks" value={form.marks} onChange={handleChange} required />
          <input className="form-control" name="grade" placeholder="Grade (A, B, C...)" value={form.grade} onChange={handleChange} required />
          <button type="submit" className="btn btn-primary">➕ Add Result</button>
        </form>
      )}

      {loading ? <Loading label="Loading results..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Student ID</th><th>Exam ID</th><th>Marks</th><th>Grade</th><th>Exam Date</th><th>Subject</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {results.length === 0 ? <tr><td colSpan={isAdmin ? 8 : 7}>No records</td></tr> : results.map(r => (
              <tr key={r.result_id}>
                <td>{r.result_id}</td><td>{r.student_id}</td><td>{r.exam_id}</td><td>{r.marks}</td><td>{r.grade}</td>
                <td>{r.exam_date ? String(r.exam_date).slice(0, 10) : "-"}</td><td>{r.subject_name || "-"}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.result_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Results;