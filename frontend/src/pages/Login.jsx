import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function Login() {
  const { role } = useParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("/api/auth/login", { ...form, role });

    // Save token and user info
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    navigate(`/dashboard/${role}`);
  } catch (err) {
    alert("Invalid email or password!", err);
  }
};

  return (
    <div style={{ backgroundColor: "#28C2A0", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card className="shadow-lg border-0" style={{ width: "400px", borderRadius: "12px" }}>
        <Card.Body>
          <h2 className="text-center mb-4 fw-bold" style={{ color: "#0C46C4" }}>Login as {role.toUpperCase()}</h2>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#000000", fontWeight: "500" }}>Email</Form.Label>
              <Form.Control type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter email" required style={{ borderRadius: "8px", borderColor: "#B3B3B3" }} />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ color: "#000000", fontWeight: "500" }}>Password</Form.Label>
              <Form.Control type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter password" required style={{ borderRadius: "8px", borderColor: "#B3B3B3" }} />
            </Form.Group>

            <Button type="submit" className="w-100" style={{ backgroundColor: "#0C46C4", border: "none", fontWeight: "600", padding: "8px", borderRadius: "8px" }}>
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;