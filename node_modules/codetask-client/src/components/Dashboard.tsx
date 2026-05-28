import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { taskApi, type TaskInput } from "../lib/api";
import type { Task } from "../types";
import { TaskModal } from "./TaskModal";
import { TaskCard } from "./TaskCard";

const socketUrl = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/api\/?$/, "");

export const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Task["status"] | "all">("all");
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let socket: Socket | null = null;
    let cancelled = false;

    const loadTasks = async () => {
      try {
        const response = await taskApi.list(token);
        if (!cancelled) {
          setTasks(response.tasks);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    socket = io(socketUrl, { auth: { token } });
    socket.on("task:created", (task: Task) => {
      setTasks(previous => [task, ...previous.filter(item => item._id !== task._id)]);
    });
    socket.on("task:updated", (task: Task) => {
      setTasks(previous => previous.map(item => (item._id === task._id ? task : item)));
    });
    socket.on("task:deleted", ({ id }: { id: string }) => {
      setTasks(previous => previous.filter(task => task._id !== id));
    });

    void loadTasks();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [token]);

  const openCreateModal = () => {
    setModalTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setModalTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveTask = async (payload: TaskInput) => {
    if (!token) {
      return;
    }

    const response = modalTask ? await taskApi.update(token, modalTask._id, payload) : await taskApi.create(token, payload);
    const nextTask = response.task;
    setTasks(previous => {
      const withoutCurrent = previous.filter(task => task._id !== nextTask._id);
      return [nextTask, ...withoutCurrent].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    });
  };

  const removeTask = async (id: string) => {
    if (!token) {
      return;
    }

    await taskApi.remove(token, id);
    setTasks(previous => previous.filter(task => task._id !== id));
  };

  const updateStatus = async (id: string, status: Task["status"]) => {
    if (!token) {
      return;
    }

    const response = await taskApi.setStatus(token, id, status);
    setTasks(previous => previous.map(task => (task._id === id ? response.task : task)));
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === "all" || task.status === filter;
    const haystack = `${task.title} ${task.description}`.toLowerCase();
    const matchesSearch = haystack.includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const counts = {
    total: tasks.length,
    todo: tasks.filter(task => task.status === "todo").length,
    progress: tasks.filter(task => task.status === "in-progress").length,
    done: tasks.filter(task => task.status === "done").length
  };

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>{user?.name ?? "Task Manager"}</h1>
          <p className="subtle">Track work, keep momentum visible, and update the board in real time.</p>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={openCreateModal}>
            New task
          </button>
          <button className="ghost-button" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article><strong>{counts.total}</strong><span>Total</span></article>
        <article><strong>{counts.todo}</strong><span>To do</span></article>
        <article><strong>{counts.progress}</strong><span>In progress</span></article>
        <article><strong>{counts.done}</strong><span>Done</span></article>
      </section>

      <section className="board-panel">
        <div className="board-toolbar">
          <label className="search-box">
            <span>Search</span>
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Title or description" />
          </label>

          <label className="filter-box">
            <span>Filter</span>
            <select value={filter} onChange={event => setFilter(event.target.value as typeof filter)}>
              <option value="all">All</option>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="empty-state">Loading tasks...</div>
        ) : filteredTasks.length ? (
          <div className="task-grid">
            {filteredTasks.map(task => (
              <TaskCard key={task._id} task={task} onEdit={openEditModal} onDelete={removeTask} onStatusChange={updateStatus} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No tasks match your view.</h3>
            <p>Create a task to start building your board.</p>
          </div>
        )}
      </section>

      {isModalOpen && <TaskModal task={modalTask} onClose={closeModal} onSave={saveTask} />}
    </main>
  );
};
