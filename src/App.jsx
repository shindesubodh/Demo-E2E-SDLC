import { useEffect, useRef, useState } from "react";
import TaskItem, { AssigneeSelect } from "./TaskItem.jsx";
import {
  ALL,
  PEOPLE,
  STATUSES,
  UNASSIGNED,
  addTask,
  countDone,
  createTask,
  deleteTask,
  filterTasks,
  loadTasks,
  saveTasks,
  toggleDone,
  updateTask,
  validateTitle,
} from "./tasks.js";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState(() => loadTasks(window.localStorage));
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [error, setError] = useState(null);
  const [person, setPerson] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const titleRef = useRef(null);

  useEffect(() => {
    saveTasks(window.localStorage, tasks);
  }, [tasks]);

  function handleAdd(e) {
    e.preventDefault();
    const err = validateTitle(title);
    if (err) {
      setError(err);
    } else {
      setTasks((ts) => addTask(ts, createTask(title, assignee)));
      setTitle("");
      setAssignee("");
      setError(null);
    }
    titleRef.current?.focus();
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

      <form className="add-form" onSubmit={handleAdd} aria-label="Add a task" noValidate>
        <div className="field grow">
          <label htmlFor="new-title">Task title</label>
          <input
            id="new-title"
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "new-title-error" : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="new-assignee">Assignee</label>
          <AssigneeSelect id="new-assignee" value={assignee} onChange={setAssignee} />
        </div>
        <button type="submit">Add task</button>
        {error && (
          <p id="new-title-error" className="error" role="alert">
            {error}
          </p>
        )}
      </form>

      <section className="filters" aria-label="Filters">
        <div className="field">
          <label htmlFor="filter-person">Person</label>
          <select id="filter-person" value={person} onChange={(e) => setPerson(e.target.value)}>
            {[ALL, ...PEOPLE, UNASSIGNED].map((p) => (
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
      </section>

      {tasks.length === 0 ? (
        <p className="empty">No tasks yet. Add one above.</p>
      ) : visible.length === 0 ? (
        <p className="empty">No tasks match these filters</p>
      ) : (
        <ul className="task-list" aria-label="Tasks">
          {visible.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggle={(id) => setTasks((ts) => toggleDone(ts, id))}
              onSave={(id, changes) => setTasks((ts) => updateTask(ts, id, changes))}
              onDelete={(id) => setTasks((ts) => deleteTask(ts, id))}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
