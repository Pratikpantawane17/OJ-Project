# 🧠 OJ-Project

An Online Judge (OJ) web application designed to allow users to solve coding problems, submit code, and view rankings — all in a responsive, full-stack environment.

---

## 🚀 Features

- 🧾 Problem browsing and detailed descriptions  
- 🧑‍💻 Code submission with live evaluation using Docker  
- 🏆 Leaderboard for competitive motivation  
- 📊 User authentication and profile tracking  
- 📦 Backend API built with Node.js and MongoDB  
- ⚛️ Frontend built with React  

---

## 💻 Tech Stack

| Layer       | Technology                        |
|-------------|------------------------------------|
| Frontend    | React, JSX, Tailwind (optional)    |
| Backend     | Node.js, Express.js                |
| Database    | MongoDB (Mongoose)                 |
| Code Runner | Docker + Node.js `child_process`   |
| Auth        | JWT, bcrypt (optional)             |

---

## ⚙️ Setup Instructions

### 🔧 Prerequisites

- Node.js (v18+ recommended)  
- MongoDB (Local or Atlas)  
- Docker (for code execution)

---

### 🧩 Backend Setup

```bash
cd server
npm install
cp .env.example .env   # Fill in DB URI, JWT secret, etc.
node server.js

🖥️ Frontend Setup
bash
cd client
npm install
npm start

🐳 Docker Setup (For codeRunner.js)
Ensure Docker is running on your machine. Your codeRunner.js uses Docker containers to compile and run submitted code securely.

🤝 Contributing
Contributions are welcome! Feel free to fork the repo and submit a pull request.

⭐ Star the repo

🍴 Fork it

👨‍💻 Create a branch

✅ Commit changes

📩 Submit a PR

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
