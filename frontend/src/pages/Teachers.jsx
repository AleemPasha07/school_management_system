import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const [form, setForm] = useState({ teacher_name: "", temail: "", tphone: "", timage: "", dob: "", school_id: "", address_id: "" });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      if (isTeacher && user?.teacher_id) {
        const res = await api.get(`/teachers/${user.teacher_id}`);
        setTeachers(res.data ? [res.data] : []);
      } else {
        const res = await api.get("/teachers");
        setTeachers(Array.isArray(res.data) ? res.data : []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTeachers(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    await api.post("/teachers", { ...form, school_id: Number(form.school_id), address_id: Number(form.address_id) });
    toastSuccess("Teacher added");
    setForm({ teacher_name: "", temail: "", tphone: "", timage: "", dob: "", school_id: "", address_id: "" });
    fetchTeachers();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this teacher?")) return;
    await api.delete(`/teachers/${id}`);
    toastSuccess("Teacher deleted");
    fetchTeachers();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Teachers</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 700 }}>
          <input className="form-control" name="teacher_name" placeholder="Teacher Name" value={form.teacher_name} onChange={handleChange} required />
          <input className="form-control" name="temail" type="email" placeholder="Email (for login)" value={form.temail} onChange={handleChange} required />
          <input className="form-control" name="tphone" placeholder="Phone" value={form.tphone} onChange={handleChange} />
          <input className="form-control" name="timage" placeholder="Image path (optional)" value={form.timage} onChange={handleChange} />
          <input className="form-control" name="dob" type="date" value={form.dob} onChange={handleChange} />
          <FetchSelect endpoint="/schools" valueKey="school_id" labelKey="school_name" value={form.school_id} onChange={(v) => setForm({ ...form, school_id: v })} placeholder="Select School" />
          <FetchSelect endpoint="/addresses" valueKey="address_id" labelKey="address_detail" value={form.address_id} onChange={(v) => setForm({ ...form, address_id: v })} placeholder="Select Address" />
          <button type="submit" className="btn btn-primary">➕ Add Teacher</button>
        </form>
      )}

      {loading ? <Loading label="Loading teachers..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>DOB</th><th>School</th><th>Address</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {teachers.length === 0 ? <tr><td colSpan={isAdmin ? 8 : 7}>No records</td></tr> : teachers.map(t => (
              <tr key={t.teacher_id}>
                <td>{t.teacher_id}</td><td>{t.teacher_name}</td><td>{t.temail}</td><td>{t.tphone || "-"}</td><td>{t.dob ? String(t.dob).slice(0, 10) : "-"}</td><td>{t.school_id}</td><td>{t.address_id}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(t.teacher_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Teachers;