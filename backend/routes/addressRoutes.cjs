const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../db.cjs");


// GET all addresses
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Address ORDER BY address_id DESC");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET one address by id
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Address WHERE address_id=@id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// CREATE a new address
router.post("/", async (req, res) => {
  const { address_detail } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("address_detail", sql.NVarChar, address_detail)
      .query("INSERT INTO Address (address_detail) VALUES (@address_detail)");

    res.json({ message: "Address added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE address
router.put("/:id", async (req, res) => {
  const { address_detail } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("address_detail", sql.NVarChar, address_detail)
      .query("UPDATE Address SET address_detail=@address_detail WHERE address_id=@id");

    res.json({ message: "Address updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE address
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Address WHERE address_id=@id");

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;