import { useEffect, useRef, useState } from "react";
import { MAX_TITLE } from "../lib/storage.js";
import { formatDate } from "../lib/dates.js";
import { addTask } from "../state/actions.js";
import { titleError } from "../state/reducer.js";
import { useStore } from "../state/StoreContext.jsx";

// Add form when `task` is not given; edit form for `task` otherwise.
export default function TaskForm({ task, onDone }) {
  const { state, dispatch } = useStore();
  const editing = Boolean(task);
  const knownAssignee = task && state.members.some((m) => m.id === task.assigneeId) ? task.assigneeId : "";
  const [title, setTitle] = useState(task?.title ?? "");
  const [assigneeId, setAssigneeId] = useState(knownAssignee);
  const [dueDate, setDueDate] = useState(task?.dueDate ?? "");
  const [error, setError] = useState(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (editing) titleRef.current.focus();
  }, [editing]);

  function handleSubmit(event) {
    event.preventDefault();
    const message = titleError(title);
    if (message) {
      setError(message);
      titleRef.current.focus();
      return;
    }
    if (editing) {
      dispatch({ type: "task/update", payload: { id: task.id, title, assigneeId, dueDate } });
      onDone();
    } else {
      dispatch(addTask({ title, assigneeId, dueDate }));
      setTitle("");
      setAssigneeId("");
      setDueDate("");
    }
    setError(null);
    titleRef.current.focus();
  }

  return (
    <section className="card" aria-labelledby="form-heading">
      <h2 id="form-heading">{editing ? "Edit task" : "Add a task"}</h2>
      <form className="grid form" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="task-title">Title (required)</label>
          <input
            id="task-title"
            ref={titleRef}
            value={title}
            maxLength={MAX_TITLE}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "task-title-error" : "task-title-count"}
          />
          {error ? (
            <div className="err" id="task-title-error" role="alert">
              {error}
            </div>
          ) : (
            <div className="hint" id="task-title-count">
              {title.length}/{MAX_TITLE}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {state.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="task-due">Due date</label>
          <input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="form-actions">
          {editing ? (
            <>
              <button className="btn" type="submit">
                Save
              </button>
              <button className="btn sec" type="button" onClick={onDone}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn" type="submit">
              Add task
            </button>
          )}
        </div>
      </form>
      {editing && <p className="hint">Created {formatDate(task.createdDate)} (does not change).</p>}
    </section>
  );
}
