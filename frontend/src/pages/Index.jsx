import React from "react";
import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Index() {
  const navigate = useNavigate();

  const goToLogin = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div style={{ backgroundColor: "#28C2A0", minHeight: "100vh", width: "100%", margin: 0, padding: 0 }}>
      <Container
        fluid
        className="d-flex flex-column justify-content-center align-items-center text-center p-0"
        style={{ minHeight: "100vh" }}
      >
        <h1 className="fw-bold mb-3" style={{ color: "#FFFFFF", fontSize: "3rem" }}>
          🏫 School Management System
        </h1>
        <p style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "40px" }}>
          Please select your role to continue
        </p>

        <div className="d-flex gap-3">
          <Button
            onClick={() => goToLogin("student")}
            style={{
              backgroundColor: "#0C46C4",
              border: "none",
              fontWeight: "600",
              padding: "10px 25px",
              borderRadius: "6px",
            }}
          >
            Student
          </Button>

          <Button
            onClick={() => goToLogin("teacher")}
            style={{
              marginLeft: "10px",
              marginRight: "10px",
              backgroundColor: "#000000",
              border: "none",
              fontWeight: "600",
              padding: "10px 25px",
              borderRadius: "6px",
              color: "#FFFFFF"
            }}
          >
            Teacher
          </Button>

          <Button
            onClick={() => goToLogin("admin")}
            style={{
              backgroundColor: "#B3B3B3",
              border: "none",
              fontWeight: "600",
              padding: "10px 25px",
              borderRadius: "6px",
              color: "#000000"
            }}
          >
            Admin
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default Index;