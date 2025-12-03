// backend/routes/courses.js
const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  db.all(`SELECT * FROM courses`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const { name, code } = req.body;

  if (!name || !code)
    return res.status(400).json({ error: "Missing name or code" });

  db.run(
    `INSERT INTO courses (name, code) VALUES (?, ?)`,
    [name, code],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ id: this.lastID, name, code });
    }
  );
});

module.exports = router;
