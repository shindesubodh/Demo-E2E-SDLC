import { useEffect, useRef, useState } from "react";
import { PEOPLE, validateTitle } from "./tasks.js";

export function AssigneeSelect({ id, value, onChange }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Unassigned</option>
      {PEOPLE.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}

export default function TaskItem({ task, onToggle, onSave, onDelete }) {
  const [mode, setMode] = useState("view"); // "view" | "edit" | "confirm-delete"
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee);
  const [error, setError] = useState(null);
  const titleRef = useRef(null);
  const editButtonRef = useRef(null);
  const cancelDeleteRef = useRef(null);
  const returnFocus = useRef(false);

  useEffect(() => {
    if (mode === "edit") titleRef.current?.focus();
    if (mode === "confirm-delete") cancelDeleteRef.current?.focus();
    if (mode === "view" && returnFocus.current) {
      returnFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [mode]);

  function startEdit() {
    setTitle(task.title);
    setAssignee(task.assignee);
    setError(null);
    setMode("edit");
  }

  function backToView() {
    returnFocus.current = true;
    setMode("view");
  }

  function handleSave(e) {
    e.preventDefault();
    const err = validateTitle(title);
    if (err) {
      setError(err);
      titleRef.current?.focus();
      return;
    }
    onSave(task.id, { title: title.trim(), assignee });
    backToView();
  }

  const checkboxId = `done-${task.id}`;

  if (mode === "edit") {
    const titleId = `edit-title-${task.id}`;
    const errorId = `edit-error-${task.id}`;
    return (
      <li className="task">
        <form
          className="task-edit"
          onSubmit={handleSave}
          onKeyDown={(e) => e.key === "Escape" && backToView()}
          aria-label={`Edit task ${task.title}`}
          noValidate
        >
          <div className="field">
            <label htmlFor={titleId}>Title</label>
            <input
              id={titleId}
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>
          <div className="field">
            <label htmlFor={`edit-assignee-${task.id}`}>Assignee</label>
            <AssigneeSelect id={`edit-assignee-${task.id}`} value={assignee} onChange={setAssignee} />
          </div>
          <div className="actions">
            <button type="submit">Save</button>
            <button type="button" className="secondary" onClick={backToView}>
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
      <div className="task-main">
        <input
          id={checkboxId}
          type="checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <label htmlFor={checkboxId} className="task-title">
          {task.title}
        </label>
        <span className="assignee">{task.assignee || "Unassigned"}</span>
      </div>
      {mode === "confirm-delete" ? (
        <div className="actions confirm" role="group" aria-label={`Confirm delete ${task.title}`}>
          <span>Delete this task?</span>
          <button type="button" className="danger" onClick={() => onDelete(task.id)}>
            Yes, delete
          </button>
          <button type="button" className="secondary" ref={cancelDeleteRef} onClick={backToView}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="actions">
          <button
            type="button"
            className="secondary"
            ref={editButtonRef}
            onClick={startEdit}
            aria-label={`Edit ${task.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setMode("confirm-delete")}
            aria-label={`Delete ${task.title}`}
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}
