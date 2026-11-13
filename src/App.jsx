import { useEffect, useState } from "react";
import "./App.css";
import {
  ALL,
  STATUSES,
  TEAM,
  UNASSIGNED,
  addTask,
  countDone,
  deleteTask,
  filterTasks,
  loadTasks,
  saveTasks,
  toggleDone,
  updateTask,
} from "./tasks.js";

function AssigneeOptions() {
  return (
    <>
      <option value="">{UNASSIGNED}</option>
      {TEAM.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </>
  );
}

function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [error, setError] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();
    const err = onAdd({ title, assignee });
    setError(err);
    if (!err) {
      setTitle("");
      setAssignee("");
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit} noValidate>
      <div className="field grow">
        <label htmlFor="new-title">Task title</label>
        <input
          id="new-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? "new-title-error" : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor="new-assignee">Assignee</label>
        <select id="new-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <AssigneeOptions />
        </select>
      </div>
      <button type="submit" className="primary">
        Add task
      </button>
      {error && (
        <p id="new-title-error" className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [mode, setMode] = useState("view"); // "view" | "edit" | "confirm-delete"
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftAssignee, setDraftAssignee] = useState(task.assignee);
  const [error, setError] = useState(null);

  function startEdit() {
    setDraftTitle(task.title);
    setDraftAssignee(task.assignee);
    setError(null);
    setMode("edit");
  }

  function handleSave(event) {
    event.preventDefault();
    const err = onUpdate(task.id, { title: draftTitle, assignee: draftAssignee });
    setError(err);
    if (!err) setMode("view");
  }

  if (mode === "edit") {
    const titleId = `edit-title-${task.id}`;
    const assigneeId = `edit-assignee-${task.id}`;
    const errorId = `edit-error-${task.id}`;
    return (
      <li className="task editing">
        <form className="edit-form" onSubmit={handleSave} noValidate>
          <div className="field grow">
            <label htmlFor={titleId}>Edit title</label>
            <input
              id={titleId}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor={assigneeId}>Edit assignee</label>
            <select id={assigneeId} value={draftAssignee} onChange={(e) => setDraftAssignee(e.target.value)}>
              <AssigneeOptions />
            </select>
          </div>
          <div className="actions">
            <button type="submit" className="primary">
              Save
            </button>
            <button type="button" onClick={() => setMode("view")}>
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
      <label className="task-main">
        <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id)} />
        <span className="task-title">{task.title}</span>
      </label>
      <span className={task.assignee ? "assignee" : "assignee none"}>{task.assignee || UNASSIGNED}</span>
      {mode === "confirm-delete" ? (
        <div className="confirm" role="group" aria-label={`Confirm delete of ${task.title}`}>
          <span>Delete this task?</span>
          <button type="button" className="danger" onClick={() => onDelete(task.id)}>
            Yes, delete
          </button>
          <button type="button" onClick={() => setMode("view")} autoFocus>
            Cancel
          </button>
        </div>
      ) : (
        <div className="actions">
          <button type="button" onClick={startEdit} aria-label={`Edit ${task.title}`}>
            Edit
          </button>
          <button type="button" onClick={() => setMode("confirm-delete")} aria-label={`Delete ${task.title}`}>
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks(window.localStorage));
  const [person, setPerson] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  useEffect(() => {
    saveTasks(window.localStorage, tasks);
  }, [tasks]);

  function handleAdd(input) {
    const result = addTask(tasks, input);
    if (!result.error) setTasks(result.tasks);
    return result.error;
  }

  function handleUpdate(id, input) {
    const result = updateTask(tasks, id, input);
    if (!result.error) setTasks(result.tasks);
    return result.error;
  }

  const visible = filterTasks(tasks, { person, status });

  return (
    <main className="app">
      <header className="app-header">
        <h1>Team To-Do Tracker</h1>
        <p className="progress" aria-live="polite">
          {countDone(tasks)} of {tasks.length} done
        </p>
      </header>

      <AddTaskForm onAdd={handleAdd} />

      <div className="filters">
        <div className="field">
          <label htmlFor="filter-person">Person</label>
          <select id="filter-person" value={person} onChange={(e) => setPerson(e.target.value)}>
            {[ALL, ...TEAM, UNASSIGNED].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add one above.</p>
      ) : visible.length === 0 ? (
        <p className="empty">No tasks match these filters</p>
      ) : (
        <ul className="task-list" aria-label="Tasks">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(id) => setTasks((prev) => toggleDone(prev, id))}
              onUpdate={handleUpdate}
              onDelete={(id) => setTasks((prev) => deleteTask(prev, id))}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
