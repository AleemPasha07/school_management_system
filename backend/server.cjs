const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();

const studentRoutes = require("./routes/studentRoutes.cjs");
const teacherRoutes = require("./routes/teacherRoutes.cjs");
const classRoutes = require("./routes/classRoutes.cjs");
const subjectRoutes = require("./routes/subjectRoutes.cjs");
const examRoutes = require("./routes/examRoutes.cjs");
const attendanceRoutes = require("./routes/attendanceRoutes.cjs");
const schoolRoutes = require("./routes/schoolRoutes.cjs");
const addressRoutes = require("./routes/addressRoutes.cjs");
const classSubjectRoutes = require("./routes/classSubjectRoutes.cjs");
const authRoutes = require("./routes/authRoutes.cjs");
const resultRoutes = require("./routes/resultRoutes.cjs");


const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/class-subjects", classSubjectRoutes);
app.use("/api/results", resultRoutes);


app.get("/", (req, res) => res.send("✅ School Management Backend running"));

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));


// Error handler
app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));