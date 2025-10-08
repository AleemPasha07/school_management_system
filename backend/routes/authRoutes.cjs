const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Secret for JWT (dalna .env me)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ LOGIN API
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .input("role", sql.NVarChar, role)
      .query(`SELECT TOP 1 * FROM Users WHERE email=@email AND role=@role`);

    if (!result.recordset.length) {
      return res.status(401).json({ error: "Invalid Email or Role" });
    }

    const user = result.recordset[0];

    console.log("AUTH DEBUG:", {
      email: user.email,
      role: user.role,
      passLen: (user.password || "").length
    });

    // ✅ Compare password with bcrypt hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    // ✅ Sign JWT token (expire after 1h)
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        student_id: user.student_id,
        teacher_id: user.teacher_id
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        role: user.role,
        student_id: user.student_id || null,
        teacher_id: user.teacher_id || null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ REGISTER USER (Admin only or for testing)
router.post("/register", async (req, res) => {
  const { email, password, role, student_id, teacher_id } = req.body;

  try {
    const hashedPass = await bcrypt.hash(password, 10); // hash pass
    const pool = await poolPromise;

    await pool.request()
      .input("email", sql.NVarChar, email)
      .input("password", sql.NVarChar, hashedPass)
      .input("role", sql.NVarChar, role)
      .input("student_id", sql.Int, student_id || null)
      .input("teacher_id", sql.Int, teacher_id || null)
      .query(`
        INSERT INTO Users (email,password,role,student_id,teacher_id)
        VALUES (@email,@password,@role,@student_id,@teacher_id)
      `);

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;