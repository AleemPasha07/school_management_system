const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");


// GET all classes
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Class ORDER BY class_id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET a single class
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Class WHERE class_id=@id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE class
router.post("/", async (req, res) => {
  const { class_name, class_year, school_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("class_name", sql.NVarChar, class_name)
      .input("class_year", sql.NVarChar, class_year) // tumne int banaya ho ya nvarchar, us hisaab se
      .input("school_id", sql.Int, school_id)
      .query("INSERT INTO Class (class_name, class_year, school_id) VALUES (@class_name, @class_year, @school_id)");

    res.json({ message: "Class added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE class
router.put("/:id", async (req, res) => {
  const { class_name, class_year, school_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("class_name", sql.NVarChar, class_name)
      .input("class_year", sql.NVarChar, class_year)
      .input("school_id", sql.Int, school_id)
      .query(`
        UPDATE Class
        SET class_name=@class_name, class_year=@class_year, school_id=@school_id
        WHERE class_id=@id
      `);

    res.json({ message: "Class updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE class
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Class WHERE class_id=@id");

    res.json({ message: "Class deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;