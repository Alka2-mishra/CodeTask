import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskPriority, TaskStatus } from "../types";
import type { TaskInput } from "../lib/api";

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (payload: TaskInput) => Promise<void>;
}

const buildInitialState = (task: Task | null): TaskInput => ({
  title: task?.title ?? "",
  description: task?.description ?? "",
  status: task?.status ?? "todo",
  priority: task?.priority ?? "medium",
  dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : null
});

export const TaskModal = ({ task, onClose, onSave }: TaskModalProps) => {
  const [form, setForm] = useState<TaskInput>(() => buildInitialState(task));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(buildInitialState(task));
    setError("");
  }, [task]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <form className="modal-card task-modal" onClick={event => event.stopPropagation()} onSubmit={submit}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">Task editor</p>
            <h3>{task ? "Update task" : "Create task"}</h3>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <label>
          Title
          <input value={form.title} onChange={event => setForm(previous => ({ ...previous, title: event.target.value }))} required />
        </label>

        <label>
          Description
          <textarea value={form.description} onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))} rows={4} />
        </label>

        <div className="form-grid">
          <label>
            Status
            <select value={form.status} onChange={event => setForm(previous => ({ ...previous, status: event.target.value as TaskStatus }))}>
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label>
            Priority
            <select value={form.priority} onChange={event => setForm(previous => ({ ...previous, priority: event.target.value as TaskPriority }))}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label>
            Due date
            <input type="date" value={form.dueDate ?? ""} onChange={event => setForm(previous => ({ ...previous, dueDate: event.target.value || null }))} />
          </label>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving..." : task ? "Update task" : "Create task"}
          </button>
        </div>
      </form>
    </div>
  );
};
