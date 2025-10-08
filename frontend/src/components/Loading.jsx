import React from "react";
import Spinner from "react-bootstrap/Spinner";
export default function Loading({ label = "Loading..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 120 }}>
      <Spinner animation="border" role="status" className="me-2" />
      <span>{label}</span>
    </div>
  );
}