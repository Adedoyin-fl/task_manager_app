import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Search, Filter, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task } from "../../shared/types";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newTaskText }),
      });
      const newTask = await response.json();
      setTasks((prev) => [...prev, newTask]);
      setNewTaskText("");
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filter === "all" ? true : filter === "completed" ? task.completed : !task.completed;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tasks, searchQuery, filter]);

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-serif italic mb-2 tracking-tight">Task Master</h1>
          <p className="text-sm uppercase tracking-widest opacity-50">Daily Productivity Suite</p>
        </header>

        <main className="bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden border border-black/5">
          {/* Add Task Input */}
          <form onSubmit={addTask} className="p-6 border-bottom border-black/5 bg-white">
            <div className="relative flex items-center">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full pl-4 pr-12 py-4 bg-[#F5F5F0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 p-2 bg-[#141414] text-white rounded-xl hover:scale-105 transition-transform active:scale-95"
              >
                <Plus size={24} />
              </button>
            </div>
          </form>

          {/* Search & Filter Bar */}
          <div className="px-6 py-4 bg-[#F5F5F0]/50 border-y border-black/5 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl text-sm focus:outline-none border border-black/5"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "pending", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    filter === f ? "bg-[#141414] text-white" : "bg-white text-[#141414] opacity-50 hover:opacity-100 border border-black/5"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px] opacity-30">
                <p className="animate-pulse">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] opacity-30 text-center p-8">
                <Filter size={48} className="mb-4" />
                <p className="text-lg">No tasks found</p>
                <p className="text-sm">Try adjusting your search or filter</p>
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task) => (
                    <motion.li
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex items-center gap-4 p-6 hover:bg-[#F5F5F0]/30 transition-colors"
                    >
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`transition-all ${task.completed ? "text-green-500" : "text-black/20 group-hover:text-black/40"}`}
                      >
                        {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-lg transition-all truncate ${task.completed ? "line-through opacity-30" : ""}`}>
                          {task.text}
                        </p>
                        <div className="flex items-center gap-2 mt-1 opacity-30 text-xs">
                          <Clock size={12} />
                          <span>{formatTimestamp(task.createdAt)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                      >
                        <Trash2 size={20} />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </main>

        <footer className="mt-8 text-center opacity-30 text-xs uppercase tracking-widest">
          &copy; 2026 Task Master &bull; Built with React & Express
        </footer>
      </div>
    </div>
  );
}
