import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Task } from "../shared/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store tasks in the root directory for persistence
const TASKS_FILE = path.join(process.cwd(), "tasks.json");

async function readTasks(): Promise<Task[]> {
  try {
    const data = await fs.readFile(TASKS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeTasks(tasks: Task[]): Promise<void> {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/tasks", async (req, res) => {
    const tasks = await readTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const tasks = await readTasks();
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { completed, text } = req.body;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);

    if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

    if (completed !== undefined) tasks[taskIndex].completed = completed;
    if (text !== undefined) tasks[taskIndex].text = text;

    await writeTasks(tasks);
    res.json(tasks[taskIndex]);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const tasks = await readTasks();
    const filteredTasks = tasks.filter((t) => t.id !== id);
    await writeTasks(filteredTasks);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
