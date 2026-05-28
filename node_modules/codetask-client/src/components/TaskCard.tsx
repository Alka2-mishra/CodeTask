import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}

const statusLabels: Record<Task["status"], string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done"
};

const priorityLabels: Record<Task["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

export const TaskCard = ({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) => {
  return (
    <article className={`task-card status-${task.status}`}>
      <div className="task-card-top">
        <div>
          <span className="task-badge">{priorityLabels[task.priority]} priority</span>
          <h3>{task.title}</h3>
        </div>
        <button className="ghost-button" type="button" onClick={() => onEdit(task)}>
          Edit
        </button>
      </div>

      <p>{task.description || "No description added yet."}</p>

      <div className="task-meta">
        <span>{statusLabels[task.status]}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
      </div>

      <div className="task-actions">
        <select value={task.status} onChange={event => onStatusChange(task._id, event.target.value as Task["status"]) }>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button type="button" className="danger-button" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </article>
  );
};
