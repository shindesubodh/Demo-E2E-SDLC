import { useEffect, useId, useState } from "react";
import {
  ALL,
  EMPTY_TITLE_ERROR,
  STATUSES,
  TEAM,
  UNASSIGNED,
  addTask,
  cleanTitle,
  deleteTask,
  filterTasks,
  loadTasks,
  progressText,
  saveTasks,
  toggleDone,
  updateTask,
} from "./tasks.js";
import "./App.css";

function AssigneeSelect({ id, value, onChange }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{UNASSIGNED}</option>
      {TEAM.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}

function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [error, setError] = useState("");
  const titleId = useId();
  const assigneeId = useId();
  const errorId = useId();

  function handleSubmit(e) {
    e.preventDefault();
    if (cleanTitle(title) === null) {
      setError(EMPTY_TITLE_ERROR);
      return;
    }
    onAdd(title, assignee);
    setTitle("");
    setAssignee("");
    setError("");
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} noValidate>
      <div className="field grow">
        <label htmlFor={titleId}>Task title</label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor={assigneeId}>Assignee</label>
        <AssigneeSelect id={assigneeId} value={assignee} onChange={setAssignee} />
      </div>
      <button type="submit">Add task</button>
      {error && (
        <p id={errorId} className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function TaskItem({ task, onToggle, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee);
  const [error, setError] = useState("");
  const checkId = useId();
  const titleId = useId();
  const assigneeId = useId();
  const errorId = useId();

  function startEdit() {
    setTitle(task.title);
    setAssignee(task.assignee);
    setError("");
    setEditing(true);
  }

  function handleSave(e) {
    e.preventDefault();
    if (cleanTitle(title) === null) {
      setError(EMPTY_TITLE_ERROR);
      return;
    }
    onSave(task.id, { title, assignee });
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Delete "${task.title}"?`)) onDelete(task.id);
  }

  if (editing) {
    return (
      <li className="task editing">
        <form className="edit-form" onSubmit={handleSave} noValidate>
          <div className="field grow">
            <label htmlFor={titleId}>Title</label>
            <input
              id={titleId}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          <div className="field">
            <label htmlFor={assigneeId}>Assignee</label>
            <AssigneeSelect id={assigneeId} value={assignee} onChange={setAssignee} />
          </div>
          <div className="actions">
            <button type="submit">Save</button>
            <button type="button" className="secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
          {error && (
            <p id={errorId} className="error" role="alert">
              {error}
            </p>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className={task.done ? "task done" : "task"}>
      <input
        id={checkId}
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <label htmlFor={checkId} className="task-title">
        {task.done ? <s>{task.title}</s> : task.title}
      </label>
      <span className="assignee">{task.assignee || UNASSIGNED}</span>
      <div className="actions">
        <button type="button" className="secondary" onClick={startEdit} aria-label={`Edit "${task.title}"`}>
          Edit
        </button>
        <button type="button" className="danger" onClick={handleDelete} aria-label={`Delete "${task.title}"`}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks());
  const [person, setPerson] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const personId = useId();
  const statusId = useId();

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const visible = filterTasks(tasks, person, status);

  return (
    <main className="app">
      <header className="app-header">
        <h1>Team To-Do Tracker</h1>
        <p className="progress" aria-live="polite">
          {progressText(tasks)}
        </p>
      </header>

      <AddTaskForm onAdd={(title, assignee) => setTasks((t) => addTask(t, title, assignee))} />

      <section className="filters" aria-label="Filters">
        <div className="field">
          <label htmlFor={personId}>Person</label>
          <select id={personId} value={person} onChange={(e) => setPerson(e.target.value)}>
            {[ALL, ...TEAM, UNASSIGNED].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={statusId}>Status</label>
          <select id={statusId} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </section>

      {visible.length === 0 ? (
        <p className="empty">
          {tasks.length === 0 && person === ALL && status === ALL
            ? "No tasks yet. Add one above."
            : "No tasks match these filters"}
        </p>
      ) : (
        <ul className="task-list" aria-label="Tasks">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(id) => setTasks((t) => toggleDone(t, id))}
              onSave={(id, changes) => setTasks((t) => updateTask(t, id, changes))}
              onDelete={(id) => setTasks((t) => deleteTask(t, id))}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
