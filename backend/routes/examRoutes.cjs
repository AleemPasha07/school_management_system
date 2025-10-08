const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");

// GET all exams
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query(`
        SELECT e.exam_id, e.date, s.subject_name, s.subject_id
        FROM Exam e
        INNER JOIN Subject s ON e.subject_id = s.subject_id
        ORDER BY e.exam_id DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET a single exam by id
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT e.exam_id, e.date, s.subject_name, s.subject_id
        FROM Exam e
        INNER JOIN Subject s ON e.subject_id = s.subject_id
        WHERE exam_id=@id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE a new exam
router.post("/", async (req, res) => {
  const { subject_id, date } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("subject_id", sql.Int, subject_id)
      .input("date", sql.Date, date)
      .query("INSERT INTO Exam (subject_id, date) VALUES (@subject_id, @date)");

    res.json({ message: "Exam added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE exam
router.put("/:id", async (req, res) => {
  const { subject_id, date } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("subject_id", sql.Int, subject_id)
      .input("date", sql.Date, date)
      .query("UPDATE Exam SET subject_id=@subject_id, date=@date WHERE exam_id=@id");

    res.json({ message: "Exam updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE exam
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = req.params.id;

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Exam WHERE exam_id=@id");

    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;