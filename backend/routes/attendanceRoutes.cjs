const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");


// GET all attendance records
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT a.attendance_id, a.date, a.status, s.student_name, s.student_id
      FROM Attendance a
      INNER JOIN Student s ON a.student_id = s.student_id
      ORDER BY a.attendance_id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET single attendance by id
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT a.attendance_id, a.date, a.status, s.student_name, s.student_id
        FROM Attendance a
        INNER JOIN Student s ON a.student_id = s.student_id
        WHERE attendance_id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Attendance not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE an attendance record
router.post("/", async (req, res) => {
  const { student_id, date, status } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("student_id", sql.Int, student_id)
      .input("date", sql.Date, date)
      .input("status", sql.NVarChar, status)
      .query(`
        INSERT INTO Attendance (student_id, date, status) 
        VALUES (@student_id, @date, @status)
      `);

    res.json({ message: "Attendance record added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE attendance
router.put("/:id", async (req, res) => {
  const { student_id, date, status } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("student_id", sql.Int, student_id)
      .input("date", sql.Date, date)
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE Attendance
        SET student_id=@student_id, date=@date, status=@status
        WHERE attendance_id=@id
      `);

    res.json({ message: "Attendance updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE attendance
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Attendance WHERE attendance_id=@id");

    res.json({ message: "Attendance deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;