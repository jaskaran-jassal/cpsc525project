const express = require("express");
const db = require("../db");

const router = express.Router();

// select from courses to get the grade
router.get("/", (req, res) => {
  db.all(`SELECT * FROM courses`, [], (err, rows) => {      // sql query
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
// insert values in course table 
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
