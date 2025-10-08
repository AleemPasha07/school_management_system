const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");
const { verifyToken, checkRole } = require("../middleware/authMiddleware.cjs");

// Admin: get all
router.get("/", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.*, e.date AS exam_date, s.subject_name, st.student_name
      FROM Results r
      JOIN Exam e ON r.exam_id = e.exam_id
      JOIN Subject s ON e.subject_id = s.subject_id
      JOIN Student st ON r.student_id = st.student_id
      ORDER BY r.result_id DESC
    `);
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Student: get own
router.get("/:studentId", verifyToken, async (req, res) => {
  const studentId = parseInt(req.params.studentId, 10);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("studentId", sql.Int, studentId)
      .query(`
        SELECT r.*, e.date AS exam_date, s.subject_name
        FROM Results r
        JOIN Exam e ON r.exam_id = e.exam_id
        JOIN Subject s ON e.subject_id = s.subject_id
        WHERE r.student_id = @studentId
        ORDER BY r.result_id DESC
      `);
    res.json(result.recordset);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add (teacher/admin)
router.post("/", verifyToken, checkRole("teacher"), async (req, res) => {
  const { student_id, exam_id, marks, grade } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("student_id", sql.Int, student_id)
      .input("exam_id", sql.Int, exam_id)
      .input("marks", sql.Int, marks)
      .input("grade", sql.NVarChar, grade)
      .query("INSERT INTO Results (student_id, exam_id, marks, grade) VALUES (@student_id,@exam_id,@marks,@grade)");
    res.json({ message: "Result added successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update (teacher/admin)
router.put("/:id", verifyToken, checkRole("teacher"), async (req, res) => {
  const { student_id, exam_id, marks, grade } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("student_id", sql.Int, student_id)
      .input("exam_id", sql.Int, exam_id)
      .input("marks", sql.Int, marks)
      .input("grade", sql.NVarChar, grade)
      .query("UPDATE Results SET student_id=@student_id, exam_id=@exam_id, marks=@marks, grade=@grade WHERE result_id=@id");
    res.json({ message: "Result updated!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete (admin)
router.delete("/:id", verifyToken, checkRole("admin"), async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request().input("id", sql.Int, req.params.id)
      .query("DELETE FROM Results WHERE result_id=@id");
    res.json({ message: "Result deleted!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;