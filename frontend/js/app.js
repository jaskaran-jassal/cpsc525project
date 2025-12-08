
const API_BASE = "http://localhost:3000/api";

let courses = [];
let assignmentsByCourse = {};
let currentCourseId = null;

const courseSelect = document.getElementById("course-select");
const newCourseBtn = document.getElementById("new-course-btn");
const assignmentForm = document.getElementById("assignment-form");
const assignmentsBody = document.getElementById("assignments-body");
const calcGradeBtn = document.getElementById("calc-grade-btn");
const gradeNumberEl = document.getElementById("grade-number");
const gradeLetterEl = document.getElementById("grade-letter");

const modal = document.getElementById("course-modal");
const courseForm = document.getElementById("course-form");
const courseCancelBtn = document.getElementById("course-cancel");


// Load all courses
async function loadCourses() {
  const res = await fetch(`${API_BASE}/courses`);
  courses = await res.json();
}

// Load assignments for a specific course
async function loadAssignments(courseId) {
  const res = await fetch(`${API_BASE}/assignments/${courseId}`);
  assignmentsByCourse[courseId] = await res.json();
}

// Load fina grade from vulnerable backend route
async function loadFinalGrade(courseId) {
  const res = await fetch(`${API_BASE}/final-grade/${courseId}`);
  return await res.json();
}

(async function initialize() {
  await loadCourses();

  if (courses.length > 0) {
    currentCourseId = courses[0].id;
    await loadAssignments(currentCourseId);
  }

  renderCourseOptions();
  renderAssignments();
  await updateDisplayedGrade();
})();


function renderCourseOptions() {
  courseSelect.innerHTML = "";

  for (const c of courses) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.code} – ${c.name}`;
    if (c.id === currentCourseId) opt.selected = true;
    courseSelect.appendChild(opt);
  }
}

function renderAssignments() {
  const list = assignmentsByCourse[currentCourseId] || [];
  assignmentsBody.innerHTML = "";

  for (const a of list) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.name}</td>
      <td>${a.score}</td>
      <td>${a.max_score}</td>
      <td>${a.weight}</td>
    `;
    assignmentsBody.appendChild(tr);
  }
}

// FINAL GRADE DISPLAY
async function updateDisplayedGrade() {
  if (!currentCourseId) {
    gradeNumberEl.textContent = "--%";
    gradeLetterEl.textContent = "No course selected";
    return;
  }

  try {
    const data = await loadFinalGrade(currentCourseId);

    const pct = Number(data.finalPercentage).toFixed(1);
    const letter = data.letter;

    // Display vulnerable grade
    gradeNumberEl.textContent = `${pct}%`;
    gradeLetterEl.textContent = `Letter grade: ${letter}`;
  } catch (err) {
    gradeNumberEl.textContent = "--%";
    gradeLetterEl.textContent = "Error loading grade";
  }
}


// Change course
courseSelect.addEventListener("change", async () => {
  currentCourseId = Number(courseSelect.value);
  await loadAssignments(currentCourseId);
  renderAssignments();
  await updateDisplayedGrade();
});

// NEW COURSE BUTTON
newCourseBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
});

// CANCEL NEW COURSE
courseCancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  courseForm.reset();
});

// SUBMIT NEW COURSE in BACKEND
courseForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("course-name").value.trim();
  const code = document.getElementById("course-code").value.trim();

  const res = await fetch(`${API_BASE}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, code }),
  });

  const saved = await res.json();
  courses.push(saved);
  assignmentsByCourse[saved.id] = [];
  currentCourseId = saved.id;

  renderCourseOptions();
  renderAssignments();
  await updateDisplayedGrade();

  modal.classList.add("hidden");
  courseForm.reset();
});

// ADD ASSIGNMENT in BACKEND
assignmentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("assign-name").value.trim();
  const score = Number(document.getElementById("assign-score").value);
  const max_score = Number(document.getElementById("assign-max").value);
  const weight = Number(document.getElementById("assign-weight").value);

  const res = await fetch(`${API_BASE}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      course_id: currentCourseId,
      name,
      score,
      max_score,
      weight,
    }),
  });

  const saved = await res.json();
  assignmentsByCourse[currentCourseId].push(saved);

  assignmentForm.reset();
  renderAssignments();
  await updateDisplayedGrade();
});

// RECALCULATE BUTTON
calcGradeBtn.addEventListener("click", async () => {
  await updateDisplayedGrade();
});
