import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const [form, setForm] = useState({ student_id: "", date: "", status: "Present" });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/attendance");
      let list = Array.isArray(res.data) ? res.data : [];
      if (isStudent && user?.student_id) list = list.filter(a => a.student_id === user.student_id);
      setAttendance(list);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAttendance(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(isAdmin || isTeacher)) return;
    await api.post("/attendance", { ...form, student_id: Number(form.student_id) });
    toastSuccess("Attendance marked");
    setForm({ student_id: "", date: "", status: "Present" });
    fetchAttendance();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this record?")) return;
    await api.delete(`/attendance/${id}`);
    toastSuccess("Attendance deleted");
    fetchAttendance();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Attendance</h1>

      {(isAdmin || isTeacher) && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 500 }}>
          <FetchSelect endpoint="/students" valueKey="student_id" labelKey="student_name" value={form.student_id} onChange={(v) => setForm({ ...form, student_id: v })} placeholder="Select Student" />
          <input className="form-control" type="date" name="date" value={form.date} onChange={handleChange} required />
          <select className="form-select" name="status" value={form.status} onChange={handleChange}>
            <option value="Present">Present</option><option value="Absent">Absent</option>
          </select>
          <button type="submit" className="btn btn-primary">➕ Mark Attendance</button>
        </form>
      )}

      {loading ? <Loading label="Loading attendance..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Date</th><th>Status</th><th>Student ID</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {attendance.length === 0 ? <tr><td colSpan={isAdmin ? 5 : 4}>No records</td></tr> : attendance.map(a => (
              <tr key={a.attendance_id}>
                <td>{a.attendance_id}</td><td>{a.date?.slice(0, 10)}</td><td>{a.status}</td><td>{a.student_id}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.attendance_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Attendance;