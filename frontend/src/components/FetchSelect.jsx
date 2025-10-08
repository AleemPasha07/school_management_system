import React, { useEffect, useState } from "react";
import api from "../utils/axiosInstance";

export default function FetchSelect({ endpoint, valueKey, labelKey, value, onChange, placeholder = "Select...", toNumber = true }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(endpoint);
        if (mounted) setOptions(Array.isArray(res.data) ? res.data : []);
      } catch (e) { console.error("FetchSelect error:", e); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [endpoint]);

  return (
    <select className="form-select" value={value} onChange={(e) => onChange(toNumber ? Number(e.target.value) : e.target.value)} disabled={loading}>
      <option value="">{loading ? "Loading..." : placeholder}</option>
      {options.map(o => <option key={o[valueKey]} value={o[valueKey]}>{o[labelKey]}</option>)}
    </select>
  );
}