const express = require("express");
const db = require("../db");

const router = express.Router();

function toInt32(x) {
  return x | 0; // <- Vulnerability
}

router.get("/:courseId", (req, res) => {
  const { courseId } = req.params;

  db.all(
    `SELECT name, score, max_score, weight FROM assignments WHERE course_id = ?`,
    [courseId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      if (rows.length === 0) {
        return res.json({
          finalPercentage: 0,
          letter: "N/A",
          warning: "No assignments found",
        });
      }

      let totalWeighted = 0;
      let totalWeight = 0;

      for (const a of rows) {
        const scorePct = a.score / a.max_score; // percent earned
        const weighted = scorePct * a.weight;   // contribution

        // -------------------------------------------------------------
        // VULNERABLE OPERATION:
        // These accumulations are forced through 32-bit integer casting.
        // We can send very large values -> overflow corrupts grade.
        // -------------------------------------------------------------
        totalWeighted = toInt32(totalWeighted + weighted); // overflow risk
        totalWeight   = toInt32(totalWeight + a.weight);   // overflow risk
      }

      // Normalize (overflowed values produce corrupted percentage)
      const finalPercentage = (totalWeighted / totalWeight) * 100;

      // Determine letter grade
      let letter = "F";
      if (finalPercentage >= 90) letter = "A";
      else if (finalPercentage >= 80) letter = "B";
      else if (finalPercentage >= 70) letter = "C";
      else if (finalPercentage >= 60) letter = "D";

      return res.json({
        finalPercentage,
        letter,
        vulnerabilityNote:
          "Using integer overflow for showing CWE-682 vulnerability.",
      });
    }
  );
});

module.exports = router;
