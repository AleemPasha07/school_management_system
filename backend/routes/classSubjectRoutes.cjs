const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");


// GET all class-subject mappings
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT cs.class_subject_id, 
             c.class_id, c.class_name, 
             s.subject_id, s.subject_name
      FROM Class_Subject cs
      INNER JOIN Class c ON cs.class_id = c.class_id
      INNER JOIN Subject s ON cs.subject_id = s.subject_id
      ORDER BY cs.class_subject_id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET a mapping by ID
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT cs.class_subject_id, 
               c.class_id, c.class_name, 
               s.subject_id, s.subject_name
        FROM Class_Subject cs
        INNER JOIN Class c ON cs.class_id = c.class_id
        INNER JOIN Subject s ON cs.subject_id = s.subject_id
        WHERE cs.class_subject_id=@id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Mapping not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE new mapping (assign subject to class)
router.post("/", async (req, res) => {
  const { class_id, subject_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("class_id", sql.Int, class_id)
      .input("subject_id", sql.Int, subject_id)
      .query(`
        INSERT INTO Class_Subject (class_id, subject_id) 
        VALUES (@class_id, @subject_id)
      `);

    res.json({ message: "Subject assigned to class successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE mapping (change subject/class)
router.put("/:id", async (req, res) => {
  const { class_id, subject_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("class_id", sql.Int, class_id)
      .input("subject_id", sql.Int, subject_id)
      .query(`
        UPDATE Class_Subject 
        SET class_id=@class_id, subject_id=@subject_id 
        WHERE class_subject_id=@id
      `);

    res.json({ message: "Mapping updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE mapping (unassign subject from class)
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Class_Subject WHERE class_subject_id=@id");

    res.json({ message: "Mapping deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;