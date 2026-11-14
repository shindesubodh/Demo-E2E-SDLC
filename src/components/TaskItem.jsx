import { formatDate, isThisWeek } from "../lib/dates.js";
import { memberName } from "../state/selectors.js";
import { useStore } from "../state/StoreContext.jsx";

export default function TaskItem({ task, today, onEdit }) {
  const { state, dispatch } = useStore();
  const done = task.status === "Done";
  const thisWeek = !done && isThisWeek(task.dueDate, today);
  const assignee = memberName(state, task.assigneeId);
  const classes = ["item", thisWeek && "week", done && "done"].filter(Boolean).join(" ");

  function toggle() {
    dispatch({ type: "task/setStatus", payload: { id: task.id, status: done ? "Pending" : "Done" } });
  }

  function remove() {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      dispatch({ type: "task/delete", payload: { id: task.id } });
    }
  }

  return (
    <li className={classes}>
      <input
        type="checkbox"
        checked={done}
        onChange={toggle}
        aria-label={`Mark ${task.title} as ${done ? "pending" : "done"}`}
      />
      <div className="body">
        <div className="t">{task.title}</div>
        <div className="meta">
          {assignee === "Unassigned" ? (
            <span className="badge b-un">Unassigned</span>
          ) : (
            <span>
              <span aria-hidden="true">👤 </span>
              {assignee}
            </span>
          )}
          <span>{task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date"}</span>
          {thisWeek && <span className="badge b-week">This week</span>}
          {done ? <span className="badge b-done">✓ Done</span> : <span className="badge b-pend">Pending</span>}
          <span>Created {formatDate(task.createdDate)}</span>
        </div>
      </div>
      <div className="acts">
        <button className="btn link" type="button" onClick={() => onEdit(task.id)} aria-label={`Edit ${task.title}`}>
          Edit
        </button>
        <button className="btn link del" type="button" onClick={remove} aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </li>
  );
}
