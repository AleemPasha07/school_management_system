const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");
const { verifyToken, checkRole } = require("../middleware/authMiddleware.cjs"); // <- Update middleware if needed
const bcrypt = require("bcrypt");

// ✅ GET all teachers (any logged-in)
router.get("/", verifyToken, async (req, res) => {   // <-- Add verifyToken
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Teacher ORDER BY teacher_id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET Single teacher by ID
router.get("/:id", verifyToken, async (req, res) => { // <-- protect
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Teacher WHERE teacher_id=@id");
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ CREATE teacher (only admin allowed)
router.post("/", verifyToken, checkRole("admin"), async (req, res) => {
  const { teacher_name, temail, tphone, tpassword, timage, dob, school_id, address_id } = req.body;
  try {
    const pool = await poolPromise;

    // Insert into Teacher table
    await pool.request()
      .input("teacher_name", sql.NVarChar, teacher_name)
      .input("temail", sql.NVarChar, temail)
      .input("tphone", sql.NVarChar, tphone)
      .input("tpassword", sql.NVarChar, tpassword) // <- real profile password field
      .input("timage", sql.NVarChar, timage)
      .input("dob", sql.Date, dob)
      .input("school_id", sql.Int, school_id)
      .input("address_id", sql.Int, address_id)
      .query(`
        INSERT INTO Teacher (teacher_name, temail, tphone, tpassword, timage, dob, school_id, address_id)
        VALUES (@teacher_name,@temail,@tphone,@tpassword,@timage,@dob,@school_id,@address_id)
      `);

    // ✅ Auto create user account with bcrypt hash
    const hashedPass = await bcrypt.hash("123456", 10); // default password
    await pool.request()
      .input("email", sql.NVarChar, temail)
      .input("password", sql.NVarChar, hashedPass)
      .input("role", sql.NVarChar, "teacher")
      .query("INSERT INTO Users (email,password,role,teacher_id) VALUES (@email,@password,@role, SCOPE_IDENTITY())");

    res.json({ message: "Teacher added & secure login created!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE teacher (admin only)
router.put("/:id", verifyToken, checkRole("admin"), async (req, res) => {
  const { teacher_name, temail, tphone, tpassword, timage, dob, school_id, address_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("teacher_name", sql.NVarChar, teacher_name)
      .input("temail", sql.NVarChar, temail)
      .input("tphone", sql.NVarChar, tphone)
      .input("tpassword", sql.NVarChar, tpassword)
      .input("timage", sql.NVarChar, timage)
      .input("dob", sql.Date, dob)
      .input("school_id", sql.Int, school_id)
      .input("address_id", sql.Int, address_id)
      .query(`
        UPDATE Teacher
        SET teacher_name=@teacher_name, temail=@temail, tphone=@tphone,
            tpassword=@tpassword, timage=@timage, dob=@dob,
            school_id=@school_id, address_id=@address_id
        WHERE teacher_id=@id
      `);
    res.json({ message: "Teacher updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE teacher (admin only)
router.delete("/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Teacher WHERE teacher_id=@id");

    res.json({ message: "Teacher deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;