# Vulnerable Grade Calculator (CWE-682: Incorrect Calculation)

## Overview
This project is a deliberately vulnerable web application demonstrating **CWE-682** including:
- **Integer Overflow in arithmetic operations**

The application simulates a student grade calculator where users:
- Create courses  
- Add assignments with scores and weights  
- View a calculated final grade  

### Frontend
- `frontend/index.html`
- `frontend/js/app.js`
- HTML/CSS/JS, no frameworks
- Runs using a static file server
- Displays all grades retrieved from the backend **including incorrect values**

### Backend
- Node.js + Express  
- SQLite database  
- Routes:
  - `POST /api/courses`
  - `POST /api/assignments`
  - `GET /api/assignments/:courseId`
  - `GET /api/final-grade/:courseId` **← contains vulnerabilities**

### Database
SQLite file automatically created:
as sqllite lib is only avaiable on linux server
- `courses(id, name, code)`
- `assignments(id, course_id, name, score, max_score, weight)`

# 🛑 Implemented Vulnerability (CWE-682)

## 1. Integer Overflow
All score arithmetic is forced into **32-bit signed integers**:

```js
function toInt32(x) {
  return x | 0;
}
```

Large inputs like 2147483647 wrap around and corrupt the total score due to overflow.
# 🚀 How to Run the Application

Everything runs on the **Linux server**.  
We can run **frontend**, **backend**, and **exploit** separately or automatically using the Makefile.

## **1. Install backend dependencies**
```
cd backend
npm install
npm install axios
```

---

## **2. Start the Backend**
```
cd backend
node server.js
```

Backend runs at:
```
http://localhost:3000
```

---

## **3. Start the Frontend**
Open new terminal:

```
cd frontend
python3 -m http.server 8080
```

Frontend opens at:
```
http://localhost:8080
```

Use the UI to add:
- Courses
- Assignments
- View vulnerable final grade
# 🧨 **4. Run the Exploit Automatically (Makefile)**

The Makefile automates the entire attack demonstration.

From project root:

```
make exploit
```

This will:

->Start backend in background  
-> Insert a malicious course  
-> Insert an **integer-overflowing assignment**  
-> Request `/api/final-grade/:id`  
_> Print exploited grade  
-> Stop backend  

##  Fix for Vulnerability:Integer Overflow
The backend used the bitwise operator:

```js
value | 0
```

This forces values into a **32-bit signed integer**, causing overflow whenever large attacker-controlled numbers are inserted.  
like adding `2147483647` wraps into negative space.

### **Fix**
- Remove all bitwise operators  
- Perform calculation using standard floating-point arithmetic  

This prevents values from overflowing and ensures accurate numeric operations.
 
