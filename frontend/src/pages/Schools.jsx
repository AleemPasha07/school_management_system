import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import FetchSelect from "../components/FetchSelect";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({ school_name: "", school_type: "", address_id: "" });

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await api.get("/schools");
      setSchools(Array.isArray(res.data) ? res.data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSchools(); }, []);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    await api.post("/schools", { ...form, address_id: Number(form.address_id) });
    toastSuccess("School added");
    setForm({ school_name: "", school_type: "", address_id: "" });
    fetchSchools();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this school?")) return;
    await api.delete(`/schools/${id}`);
    toastSuccess("School deleted");
    fetchSchools();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Schools</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "grid", gap: 10, maxWidth: 600 }}>
          <input className="form-control" name="school_name" placeholder="School Name" value={form.school_name} onChange={handleChange} required />
          <input className="form-control" name="school_type" placeholder="Type (Private/Government)" value={form.school_type} onChange={handleChange} required />
          <FetchSelect endpoint="/addresses" valueKey="address_id" labelKey="address_detail" value={form.address_id} onChange={(v) => setForm({ ...form, address_id: v })} placeholder="Select Address" />
          <button type="submit" className="btn btn-primary">➕ Add School</button>
        </form>
      )}

      {loading ? <Loading label="Loading schools..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Address ID</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {schools.length === 0 ? <tr><td colSpan={isAdmin ? 5 : 4}>No records</td></tr> : schools.map(sc => (
              <tr key={sc.school_id}>
                <td>{sc.school_id}</td><td>{sc.school_name}</td><td>{sc.school_type}</td><td>{sc.address_id}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(sc.school_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Schools;