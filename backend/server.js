const express = require("express");
const cors = require("cors");

const coursesRouter = require("./routes/courses");
const assignmentsRouter = require("./routes/assignments");
const finalGradeRouter = require("./routes/finalgrade");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/courses", coursesRouter);
app.use("/api/assignments", assignmentsRouter);
app.use("/api/final-grade", finalGradeRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
