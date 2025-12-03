// backend/routes/finalgrade.js
const express = require("express");
const db = require("../db");

const router = express.Router();

// Helper: force to 32-bit signed integer (vulnerability)
function toInt32(x) {
  return x | 0;
}

// GET /api/courses/:id/final-grade
router.get("/:courseId", (req, res) => {
  const { courseId } = req.params;

  db.all(
    `SELECT * FROM assignments WHERE course_id = ?`,
    [courseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length === 0) {
        return res.json({
          finalPercentage: 0,
          letter: "N/A",
          warning: "No assignments found"
        });
      }

      // -------------------------------
      // Vulnerability #1: Integer Overflow
      // -------------------------------
      let totalScore = 0;

      for (const a of rows) {
        // Each score forced into 32-bit integer
        const s = toInt32(a.score);
        totalScore = toInt32(totalScore + s); // Overflow happens here
      }

      // -------------------------------
      // Vulnerability #2: Wrong Weighted Average Formula
      // -------------------------------
      const n = rows.length;

      // WRONG formula on purpose:
      // Instead of doing (score/max)*weight
      // we divide totalScore by n*100, then multiply
      const finalPercentage = (totalScore / (n * 100)) * 100;

      // Clamp percentage to look “normal”
      const pct = Math.max(-9999, Math.min(9999, finalPercentage));

      // Convert to letter grade
      let letter = "F";
      if (pct >= 90) letter = "A";
      else if (pct >= 80) letter = "B";
      else if (pct >= 70) letter = "C";
      else if (pct >= 60) letter = "D";

      return res.json({
        finalPercentage: pct,
        letter,
        vulnerabilityNote:
          "This calculation is intentionally incorrect (CWE-682)."
      });
    }
  );
});

module.exports = router;
