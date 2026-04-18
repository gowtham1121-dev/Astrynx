# 🚀 Smart Planner

A simple and intelligent task management web app that helps users plan assignments, track deadlines, and improve productivity.

---

## 📌 Features

* 📋 Add and manage assignments
* ⏳ Track deadlines and urgency
* ✅ Mark tasks as completed
* ❌ Mark missed deadlines
* 📊 View basic stats and progress
* 🎯 Daily planning support

---

## 🧠 Idea

Smart Planner helps students avoid procrastination by organizing tasks based on urgency and deadlines. It gives a clear overview of what needs to be done and when.

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* JavaScript
* CSS (inline styling)

### Backend

* Node.js
* Express.js
* JSON-based storage

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd smart-planner
```

---

### 2. Run Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on:

```
http://localhost:3001
```

---

### 3. Run Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔗 API Endpoints

* `GET /api/assignments`
* `POST /api/assignments`
* `PATCH /api/assignments/:id/complete`
* `PATCH /api/assignments/:id/missed`
* `GET /api/stats`
* `GET /api/daily-plan`

---

## 📷 Demo

(Add screenshots or demo video link here)

---

## ⚠️ Notes

* Backend uses a simple JSON file (`db.json`) for storage
* No authentication implemented
* Built for hackathon/demo purposes

---

## 🚀 Future Improvements

* User authentication
* AI-based task prioritization
* Notifications & reminders
* Better UI/UX
* Database integration

---

## 👨‍💻 Team

* Frontend: Your friend
* Backend + Integration: You

---

## 📄 License

This project is for educational and hackathon use.
