import React from "react";
import { NavLink, useParams } from "react-router-dom";

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

function Sidebar() {
  const { role } = useParams();
  const items = MENU[role] || [];
  return (
    <nav className="d-flex flex-column p-2" style={{ minWidth: 220 }}>
      {items.map((i) => (
        <NavLink key={i.path} to={`/dashboard/${role}/${i.path}`} className={({ isActive }) => `nav-link custom-link ${isActive ? "active" : ""}`} end>
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}
export default Sidebar;