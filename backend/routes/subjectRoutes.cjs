const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");


// GET all subjects
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM Subject ORDER BY subject_id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET a single subject by id
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Subject WHERE subject_id=@id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE a new subject
router.post("/", async (req, res) => {
  const { subject_name, teacher_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("subject_name", sql.NVarChar, subject_name)
      .input("teacher_id", sql.Int, teacher_id)
      .query("INSERT INTO Subject (subject_name, teacher_id) VALUES (@subject_name, @teacher_id)");
    res.json({ message: "Subject added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE subject
router.put("/:id", async (req, res) => {
  const { subject_name, teacher_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("subject_name", sql.NVarChar, subject_name)
      .input("teacher_id", sql.Int, teacher_id)
      .query("UPDATE Subject SET subject_name=@subject_name, teacher_id=@teacher_id WHERE subject_id=@id");
    res.json({ message: "Subject updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE subject
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = req.params.id;

    // Pehle related rows delete karo
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Class_Subject WHERE subject_id=@id");

    // Ab subject delete karo
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Subject WHERE subject_id=@id");

    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;