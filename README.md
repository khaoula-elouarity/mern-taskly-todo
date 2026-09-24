# 🚀 Taskly - Full-Stack MERN To-Do Application

A modern, highly responsive, and secure Full-Stack To-Do List application built using the **MERN** stack (MongoDB, Express, React, Node.js) with JWT Authentication.

---

## ✨ Features

- **🔐 Secure Authentication:** User Register & Login system using `bcryptjs` for password hashing and `JSON Web Tokens (JWT)` for authorization.
- **📝 Private Task Management:** Every user gets their own isolated environment. Tasks are linked directly to user IDs in MongoDB.
- **⚡ Modern UI/UX:** Clean, sleek design with dynamic feedback and responsive layout for mobile and desktop.
- **⚡ Real-time API Integration:** Axios instances configured with dynamic authorization interceptors.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), CSS3 / Custom Styling, Lucide-React Icons, Axios.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Mongoose ODM).
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt.js.
- **Process Manager:** Concurrently & Nodemon.

---

## 📂 Project Structure

```text
todolist/
├── client/              # React Frontend (Vite)
│   ├── src/
│   │   ├── api.js       # Axios Configuration with JWT Interceptor
│   │   ├── Auth.jsx     # Login / Register Component
│   │   ├── TodoList.jsx # Main Dashboard & Task Management
│   │   ├── App.jsx      # Main Application Router/State
│   │   └── index.css    # UI Styles
├── server/              # Node.js / Express Backend
│   ├── config/          # Database Connection (MongoDB)
│   ├── models/          # User & Todo Schemas
│   ├── routes/          # Auth & Todo API Routes
│   ├── middleware/      # JWT Security Middleware
│   └── server.js        # Express Entry Point
├── package.json         # Concurrently Root Runner
└── README.md