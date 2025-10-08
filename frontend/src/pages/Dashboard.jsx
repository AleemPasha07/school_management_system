import React from "react";
import { useParams, NavLink, Routes, Route, Navigate } from "react-router-dom";
import { Container, Card } from "react-bootstrap";

// Pages
import Students from "./Students";
import Teachers from "./Teachers";
import Classes from "./Classes";
import Subjects from "./Subjects";
import Attendance from "./Attendance";
import Exams from "./Exams";
import Results from "./Results";
import Schools from "./Schools";
import Addresses from "./Addresses";
import ClassSubjects from "./ClassSubjects";

function Dashboard() {
  const { role } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <p>Please login first!</p>;

  const MENU = {
    student: [
      { label: "My Profile", path: "profile" },
      { label: "My Attendance", path: "attendance" },
      { label: "My Exams", path: "exams" },
      { label: "My Results", path: "results" },
    ],
    teacher: [
      { label: "Teacher Profile", path: "teachers" },
      { label: "Manage Classes", path: "classes" },
      { label: "Manage Subjects", path: "subjects" },
      { label: "Student List", path: "students" },
      { label: "Schedule Exams", path: "exams" },
      { label: "Results", path: "results" },
    ],
    admin: [
      { label: "Schools", path: "schools" },
      { label: "Addresses", path: "addresses" },
      { label: "Teachers", path: "teachers" },
      { label: "Students", path: "students" },
      { label: "Classes", path: "classes" },
      { label: "Subjects", path: "subjects" },
      { label: "Exams", path: "exams" },
      { label: "Attendance", path: "attendance" },
      { label: "Class-Subject Mapping", path: "class-subjects" },
      { label: "Results", path: "results" },
    ],
  };

  const items = MENU[role] || [];

  return (
    <div style={{ backgroundColor: "#28C2A0", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Container style={{ maxWidth: "1000px" }}>
        <Card className="shadow-lg border-0 w-100" style={{ borderRadius: "12px" }}>
          <Card.Body className="d-flex">

            {/* Sidebar */}
            <nav className="d-flex flex-column p-2 me-4" style={{ minWidth: 220 }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0" style={{ color: "#0C46C4" }}>{role.toUpperCase()} MENU</h5>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                  }}
                >
                  Logout
                </button>
              </div>

              {items.map(i => (
                <NavLink
                  key={i.path}
                  to={`/dashboard/${role}/${i.path}`}
                  className={({ isActive }) => `nav-link custom-link ${isActive ? "active" : ""}`}
                  end
                >
                  {i.label}
                </NavLink>
              ))}
            </nav>

            {/* Content Section */}
            <div style={{ flex: 1 }}>
              <h4 style={{ color: "#0C46C4" }}>Welcome, {role.toUpperCase()}</h4>
              <p style={{ color: "#B3B3B3" }}>Logged in as: <b style={{ color: "#000" }}>{user.email}</b></p>

              <Routes>
                {/* Default redirect per role */}
                {role === "student" && <Route index element={<Navigate to="profile" replace />} />}
                {role === "teacher" && <Route index element={<Navigate to="teachers" replace />} />}
                {role === "admin" && <Route index element={<Navigate to="schools" replace />} />}

                {/* Student sub-routes */}
                <Route path="profile" element={<Students />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="exams" element={<Exams />} />
                <Route path="results" element={<Results />} />

                {/* Teacher/Admin pages */}
                <Route path="teachers" element={<Teachers />} />
                <Route path="students" element={<Students />} />
                <Route path="classes" element={<Classes />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="exams" element={<Exams />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="results" element={<Results />} />

                {/* Admin-only */}
                <Route path="schools" element={<Schools />} />
                <Route path="addresses" element={<Addresses />} />
                <Route path="class-subjects" element={<ClassSubjects />} />
              </Routes>
            </div>

          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Dashboard;