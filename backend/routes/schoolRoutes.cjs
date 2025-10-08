const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");

// GET all schools
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT sc.school_id, sc.school_name, sc.school_type, ad.address_detail, ad.address_id
      FROM School sc
      INNER JOIN Address ad ON sc.address_id = ad.address_id
      ORDER BY sc.school_id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one school
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query(`
        SELECT sc.school_id, sc.school_name, sc.school_type, ad.address_detail, ad.address_id
        FROM School sc
        INNER JOIN Address ad ON sc.address_id = ad.address_id
        WHERE sc.school_id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "School not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE school
router.post("/", async (req, res) => {
  const { school_name, school_type, address_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("school_name", sql.NVarChar, school_name)
      .input("school_type", sql.NVarChar, school_type)
      .input("address_id", sql.Int, address_id)
      .query(`
        INSERT INTO School (school_name, school_type, address_id)
        VALUES (@school_name, @school_type, @address_id)
      `);

    res.json({ message: "School added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE school
router.put("/:id", async (req, res) => {
  const { school_name, school_type, address_id } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("school_name", sql.NVarChar, school_name)
      .input("school_type", sql.NVarChar, school_type)
      .input("address_id", sql.Int, address_id)
      .query(`
        UPDATE School 
        SET school_name=@school_name, school_type=@school_type, address_id=@address_id
        WHERE school_id=@id
      `);

    res.json({ message: "School updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE school
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = req.params.id;

    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM School WHERE school_id=@id");

    res.json({ message: "School deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;