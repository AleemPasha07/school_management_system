import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student_name: "",
    email: "",
    student_phone: "",
    dob: "",
    school_id: "",
    address_id: "",
    class_id: ""
  });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (isStudent && user?.student_id) {
        const res = await api.get(`/students/${user.student_id}`);
        setStudents(res.data ? [res.data] : []);
      } else {
        const res = await api.get("/students");
        setStudents(Array.isArray(res.data) ? res.data : []);
      }
    } finally {
      setLoading(false); // errors are auto-toasted by axios interceptor
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    await api.post("/students", {
      ...form,
      school_id: Number(form.school_id),
      address_id: Number(form.address_id),
      class_id: Number(form.class_id)
    });
    toastSuccess("Student added");
    setForm({ student_name: "", email: "", student_phone: "", dob: "", school_id: "", address_id: "", class_id: "" });
    fetchStudents();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this student?")) return;
    await api.delete(`/students/${id}`);
    toastSuccess("Student deleted");
    fetchStudents();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Students</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 700 }}>
          <input className="form-control" name="student_name" placeholder="Name" value={form.student_name} onChange={handleChange} required />
          <input className="form-control" name="email" type="email" placeholder="Email (for login)" value={form.email} onChange={handleChange} required />
          <input className="form-control" name="student_phone" placeholder="Phone" value={form.student_phone} onChange={handleChange} />
          <input className="form-control" name="dob" type="date" value={form.dob} onChange={handleChange} />
          <FetchSelect endpoint="/schools" valueKey="school_id" labelKey="school_name" value={form.school_id} onChange={(v) => setForm({ ...form, school_id: v })} placeholder="Select School" />
          <FetchSelect endpoint="/addresses" valueKey="address_id" labelKey="address_detail" value={form.address_id} onChange={(v) => setForm({ ...form, address_id: v })} placeholder="Select Address" />
          <FetchSelect endpoint="/classes" valueKey="class_id" labelKey="class_name" value={form.class_id} onChange={(v) => setForm({ ...form, class_id: v })} placeholder="Select Class" />
          <button type="submit" className="btn btn-primary">➕ Add Student</button>
        </form>
      )}

      {loading ? (
        <Loading label="Loading students..." />
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Email (Users)</th><th>Phone</th><th>DOB</th><th>School</th><th>Address</th><th>Class</th>{isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={isAdmin ? 9 : 8}>No records</td></tr>
            ) : students.map(s => (
              <tr key={s.student_id}>
                <td>{s.student_id}</td>
                <td>{s.student_name}</td>
                <td>-</td>
                <td>{s.student_phone || "-"}</td>
                <td>{s.dob ? String(s.dob).slice(0, 10) : "-"}</td>
                <td>{s.school_id}</td>
                <td>{s.address_id}</td>
                <td>{s.class_id}</td>
                {isAdmin && (
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.student_id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Students;