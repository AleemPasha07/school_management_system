import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const [form, setForm] = useState({ class_name: "", class_year: "", school_id: "" });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/classes");
      setClasses(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(isAdmin || isTeacher)) return;
    await api.post("/classes", { ...form, school_id: Number(form.school_id) });
    toastSuccess("Class added");
    setForm({ class_name: "", class_year: "", school_id: "" });
    fetchClasses();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this class?")) return;
    await api.delete(`/classes/${id}`);
    toastSuccess("Class deleted");
    fetchClasses();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Classes</h1>

      {(isAdmin || isTeacher) && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 600 }}>
          <input className="form-control" name="class_name" placeholder="Class Name" value={form.class_name} onChange={handleChange} required />
          <input className="form-control" type="date" name="class_year" value={form.class_year} onChange={handleChange} required />
          <FetchSelect endpoint="/schools" valueKey="school_id" labelKey="school_name" value={form.school_id} onChange={(v) => setForm({ ...form, school_id: v })} placeholder="Select School" />
          <button type="submit" className="btn btn-primary">➕ Add Class</button>
        </form>
      )}

      {loading ? <Loading label="Loading classes..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Name</th><th>Year</th><th>School ID</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {classes.length === 0 ? <tr><td colSpan={isAdmin ? 5 : 4}>No records</td></tr> : classes.map(c => (
              <tr key={c.class_id}>
                <td>{c.class_id}</td><td>{c.class_name}</td><td>{c.class_year?.slice(0, 10)}</td><td>{c.school_id}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.class_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Classes;