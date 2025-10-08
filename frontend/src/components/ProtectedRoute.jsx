import React from "react";
import { Navigate, useParams } from "react-router-dom";

function ProtectedRoute({ children, allowed }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { role: urlRole } = useParams();

  if (!token || !user) return <Navigate to="/" replace />;
  if (urlRole && user.role !== urlRole) return <Navigate to={`/dashboard/${user.role}`} replace />;
  if (allowed && !allowed.includes(user.role)) return <Navigate to={`/dashboard/${user.role}`} replace />;
  return children;
}
export default ProtectedRoute;