const express = require("express");
const db = require("../db");

const router = express.Router();

// Get assignments for a course
router.get("/:courseId", (req, res) => {
  const { courseId } = req.params;

  db.all(
    `SELECT * FROM assignments WHERE course_id = ?`,
    [courseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Add assignment
router.post("/", (req, res) => {
  const { course_id, name, score, max_score, weight } = req.body;

  if (!course_id || !name || score === undefined)
    return res.status(400).json({ error: "Missing fields" });

  db.run(
    `INSERT INTO assignments (course_id, name, score, max_score, weight)
     VALUES (?, ?, ?, ?, ?)`,
    [course_id, name, score, max_score, weight],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        id: this.lastID,
        course_id,
        name,
        score,
        max_score,
        weight,
      });
    }
  );
});

module.exports = router;
