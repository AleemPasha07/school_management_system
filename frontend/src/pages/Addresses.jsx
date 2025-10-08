import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import Loading from "../components/Loading";
import { toastSuccess } from "../utils/toast";

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState({ address_detail: "" });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/addresses");
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);
  const handleChange = (e) => setForm({ address_detail: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    await api.post("/addresses", form);
    toastSuccess("Address added");
    setForm({ address_detail: "" });
    fetchAddresses();
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this address?")) return;
    await api.delete(`/addresses/${id}`);
    toastSuccess("Address deleted");
    fetchAddresses();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Addresses</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, display: "flex", gap: 10, maxWidth: 600 }}>
          <input className="form-control" name="address_detail" placeholder="Address detail" value={form.address_detail} onChange={handleChange} required />
          <button type="submit" className="btn btn-primary">➕ Add</button>
        </form>
      )}

      {loading ? <Loading label="Loading addresses..." /> : (
        <table className="table table-striped">
          <thead><tr><th>ID</th><th>Detail</th>{isAdmin && <th>Actions</th>}</tr></thead>
          <tbody>
            {addresses.length === 0 ? <tr><td colSpan={isAdmin ? 3 : 2}>No records</td></tr> : addresses.map(a => (
              <tr key={a.address_id}>
                <td>{a.address_id}</td><td>{a.address_detail}</td>
                {isAdmin && <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.address_id)}>Delete</button></td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default Addresses;