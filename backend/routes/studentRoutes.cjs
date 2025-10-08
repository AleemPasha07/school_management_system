const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");
const { verifyToken, checkRole } = require("../middleware/authMiddleware.cjs"); // JWT + role middleware
const bcrypt = require("bcrypt");

// GET all students (Admin or Teacher)
router.get("/", verifyToken, checkRole("teacher"), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Student ORDER BY student_id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student
// - Student can fetch only their own record
// - Teacher/Admin can fetch any
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const requestedId = parseInt(req.params.id, 10);
    const role = req.user?.role;
    const userStudentId = req.user?.student_id;

    if (role === "student" && userStudentId !== requestedId) {
      return res.status(403).json({ error: "You can only access your own profile." });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, requestedId)
      .query("SELECT * FROM Student WHERE student_id=@id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE student (Admin only) + auto-create Users login (bcrypt hashed default password)
router.post("/", verifyToken, checkRole("admin"), async (req, res) => {
  const { student_name, student_phone, dob, school_id, address_id, class_id, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required to create a login." });
  }

  try {
    const pool = await poolPromise;

    // Insert student and get the new student_id
    const insertResult = await pool.request()
      .input("student_name", sql.NVarChar, student_name)
      .input("student_phone", sql.NVarChar, student_phone)
      .input("dob", sql.Date, dob)
      .input("school_id", sql.Int, school_id)
      .input("address_id", sql.Int, address_id)
      .input("class_id", sql.Int, class_id)
      .query(`
        INSERT INTO Student (student_name, student_phone, dob, school_id, address_id, class_id)
        OUTPUT INSERTED.student_id AS student_id
        VALUES (@student_name, @student_phone, @dob, @school_id, @address_id, @class_id);
      `);

    const newStudentId = insertResult.recordset?.[0]?.student_id;
    if (!newStudentId) {
      return res.status(500).json({ error: "Failed to read new student_id." });
    }

    // Hash a default password securely (you can send a password in body instead)
    const hashedPass = await bcrypt.hash("123456", 10);

    // Create Users login row tied to this student
    await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPass)
      .input("role", sql.NVarChar, "student")
      .input("student_id", sql.Int, newStudentId)
      .query(`
        INSERT INTO Users (email, password, role, student_id)
        VALUES (@email, @password, @role, @student_id);
      `);

    res.json({ message: "Student added & secure login created!", student_id: newStudentId });
  } catch (err) {
    // Handle unique email conflicts gracefully
    if (err && /UNIQUE/i.test(err.message)) {
      return res.status(409).json({ error: "Email already exists in Users." });
    }
    res.status(500).json({ error: err.message });
  }
});

// UPDATE student (Admin only)
router.put("/:id", verifyToken, checkRole("admin"), async (req, res) => {
  const { student_name, student_phone, dob, school_id, address_id, class_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("student_name", sql.NVarChar, student_name)
      .input("student_phone", sql.NVarChar, student_phone)
      .input("dob", sql.Date, dob)
      .input("school_id", sql.Int, school_id)
      .input("address_id", sql.Int, address_id)
      .input("class_id", sql.Int, class_id)
      .query(`
        UPDATE Student 
        SET student_name=@student_name, student_phone=@student_phone, dob=@dob,
            school_id=@school_id, address_id=@address_id, class_id=@class_id
        WHERE student_id=@id
      `);
    res.json({ message: "Student updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE student (Admin only)
router.delete("/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Student WHERE student_id=@id");
    res.json({ message: "Student deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;