# <img width="50" height="50" alt="logo_white" src="https://github.com/user-attachments/assets/1188822c-612a-4fae-8862-0c9784ae4cbb" /> AlgoArena - Online Judge 

AlgoArena is a full-stack Online Judge (OJ) web platform designed to help users practice coding problems, run their solutions, and receive immediate feedback through custom compiler logic. It supports user authentication, admin-managed problems, test case evaluation, and multi-language code execution.

> 🚀 Project is actively under development. Current status: ✅ Custom Input Execution completed.

---

## 📌 Features Implemented

### 🔐 Authentication & Authorization
- User Sign-Up & Login using JWT
- Protected routes with middleware (soft & hard checks)
- Role-based access control for Admin features

### 📋 Problem Management (Admin)
- Create, Update, and Delete problems
- Upload test cases with problems
- Admin-only access to `/problem-form` and `/problemlist`

### 👨‍💻 User Dashboard
- Home Page with conditional rendering based on auth status
- List of problems for users to attempt
- Detailed problem view page with code editor

### 🛠️ Compiler Integration
- Custom-built compiler server (Node.js + Docker-ready)
- Multi-language support (e.g., C++, Python, JavaScript)
- Code execution with support for **custom input**

---

## ⚙️ Tech Stack

| Layer        | Technology                         |
|-------------|------------------------------------|
| Frontend     | React, TailwindCSS, Axios          |
| Backend      | Node.js, Express.js, JWT           |
| Database     | MongoDB Atlas                      |
| Compiler     | Node.js-based microservice (custom)|
| Version Ctrl | Git, GitHub                        |
| Future       | Docker (Containerization planned)  |

---

## 📂 Project Structure (WIP)

```

OJ-Project/
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── ...
├── compiler/
│   └── index.js
├── client/
│   └── src/
│        └── components/
│                    ├── Home.jsx
│                    ├── Problem.jsx
│                    ├── ...
├── README.md
└── .env

````

---

## 🚧 Upcoming Features

- 🔄 Dockerization of entire stack
- 🧠 AI Assistant for performance analysis
- 📈 Leaderboard, Streaks & History
- 🌗 Dark/Light Mode & Responsive Layout (For some pages it is Integrated)

---

## 📆 Development Progress (Selected Highlights)

| Date       | Milestone                                   | Commit Link |
|------------|---------------------------------------------|-------------|
| 18 June 25 | Project initialized, directory structure set | [🔗](https://github.com/Pratikpantawane17/OJ-Project/commit/874862bc2cea841c978ba32f7efdfa660c0ad817) |
| 20 June 25 | Frontend Sign-Up Page done (React)           | [🔗](https://github.com/Pratikpantawane17/OJ-Project/commit/4bc1a7e4c1c535aae33d1a8197aee07b67fe2615) |
| 24 June 25 | Auth Middleware added                        | [🔗](https://github.com/Pratikpantawane17/OJ-Project/commit/4512ffb89c7cadd6b04ec9116fa2a559d384e68b) |
| 28 June 25 | Problem List page + Admin Controls           | [🔗](https://github.com/Pratikpantawane17/OJ-Project/commit/e075c3e7ce56f6f2382723efd6487826682bb444) |
| 03 July 25 | Compiler Server with `/run` route created    | [🔗](https://github.com/Pratikpantawane17/OJ-Project/commit/c182fa477a6e201f5b43d498238f85132c2262df) |
| 04 July 25 | Custom Input execution added                 | [🔗](https://github.com/Pratikpantawane17/OJ-Project/commit/4c1b20364a912a04c83ca8fb02feccf7db53a44b) |

---

## 🧭 How to Run Locally

### 🔧 Prerequisites
- Node.js v18+
- MongoDB Atlas URI (or local Mongo)
- [Optional] Docker (for future version)

### 🚀 Steps
```bash
# Clone the repo
git clone https://github.com/Pratikpantawane17/OJ-Project.git
cd OJ-Project

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend & frontend
cd ../backend && npm run dev
cd ../frontend && npm start
````

---

## 🙋‍♂️ Maintainer

> 👨‍💻 Pratik Pantawane
> Currently pursuing B.Tech | ATF Fellow | SWE Co-op Intern @ AlgoUniversity
> 🔗 [GitHub](https://github.com/Pratikpantawane17) | ✉️ [Email](mailto:pratikpantawane17@gmail.com)

---

## ⭐ Show Your Support

If you like this project, feel free to:

* ⭐ Star the repo
* 📥 Open issues or suggestions
* 🛠 Contribute (coming soon)

---

```
