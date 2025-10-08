import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const [form, setForm] = useState({ subject_name: "", teacher_id: "" });

  useEffect(() => {
    if (isTeacher && user?.teacher_id) {
      setForm(f => ({ ...f, teacher_id: user.teacher_id }));
    }
  }, [isTeacher, user?.teacher_id]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/subjects");
      let list = Array.isArray(res.data) ? res.data : [];
      if (isTeacher && user?.teacher_id) list = list.filter(s => s.teacher_id === user.teacher_id);
      setSubjects(list);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(isAdmin || isTeacher)) return;
    await api.post("/subjects", { ...form, teacher_id: Number(form.teacher_id) });
    toastSuccess("Subject added");
    setForm({ subject_name: "", teacher_id: isTeacher ? user?.teacher_id || "" : "" });
    fetchSubjects();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this subject?")) return;
    await api.delete(`/subjects/${id}`);
    toastSuccess("Subject deleted");
    fetchSubjects();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Subjects</h1>

      {(isAdmin || isTeacher) && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 600 }}>
          <input className="form-control" name="subject_name" placeholder="Subject Name" value={form.subject_name} onChange={handleChange} required />
          {isTeacher ? (
            <input className="form-control" value={`Your Teacher ID: ${user?.teacher_id ?? "-"}`} disabled />
          ) : (
            <FetchSelect endpoint="/teachers" valueKey="teacher_id" labelKey="teacher_name" value={form.teacher_id} onChange={(v) => setForm({ ...form, teacher_id: v })} placeholder="Select Teacher" />
          )}
          <button type="submit" className="btn btn-primary">➕ Add Subject</button>
        </form>
      )}

      {loading ? <Loading label="Loading subjects..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Subject</th><th>Teacher ID</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {subjects.length === 0 ? <tr><td colSpan={isAdmin ? 4 : 3}>No records</td></tr> : subjects.map(s => (
              <tr key={s.subject_id}>
                <td>{s.subject_id}</td><td>{s.subject_name}</td><td>{s.teacher_id}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.subject_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Subjects;