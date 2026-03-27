# 📝 To-Do List Web App

A simple full-stack To-Do List application that allows users to create, view, update, and delete tasks with persistent storage using a backend API.

---

## 🚀 Features

### Core Features
- Create new tasks
- View all tasks
- Toggle task status (Pending ↔ Completed)
- Delete tasks

### Data Persistence
- Tasks are stored in a backend database/file
- Uses a backend API (NOT localStorage)

---

## 🛠️ Tech Stack

### Frontend
- React (with Vite)

### Backend
- Node.js
- Express

### Storage
- JSON file (or SQLite / lightweight database)

**Why this stack?**

React was chosen for its fast, component-based architecture which makes UI development modular and efficient.  
Node.js with Express is used for the backend because it allows fast and simple creation of REST APIs using JavaScript across both frontend and backend.  
A simple JSON file or lightweight database keeps the project easy to run locally and focused on API integration instead of complex database setup.

---

## 📦 How to Run the App Locally

### 1. Clone the project
```bash
git clone <your-repo-url>
cd <project-folder>
## Run Locally
1. Install dependencies:
   npm install
2. Start development server:
   npm run dev
3. Open the app in your browser at:
   http://localhost:5173



**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
<img width="947" height="402" alt="image" src="https://github.com/user-attachments/assets/6b8d4430-ca3a-4df8-8ccf-d23da6263d94" />
