import { useMemo, useState } from "react";
import { todayISO } from "../lib/dates.js";
import { memberName, selectVisibleTasks } from "../state/selectors.js";
import { useStore } from "../state/StoreContext.jsx";
import ClearCompletedButton from "./ClearCompletedButton.jsx";
import FilterBar from "./FilterBar.jsx";
import TaskForm from "./TaskForm.jsx";
import TaskItem from "./TaskItem.jsx";

export const DEFAULT_FILTERS = { status: "Pending", assignee: "All" };

function listHeading(state, filters) {
  const status = filters.status === "All" ? "all" : filters.status.toLowerCase();
  if (filters.assignee === "All") return `${status[0].toUpperCase()}${status.slice(1)} tasks`;
  const who = filters.assignee === "Unassigned" ? "Unassigned" : memberName(state, filters.assignee);
  return `${who} – ${status} tasks`;
}

export default function TaskListScreen() {
  const { state } = useStore();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editingId, setEditingId] = useState(null);
  const visible = useMemo(() => selectVisibleTasks(state, filters), [state, filters]);
  const editingTask = state.tasks.find((t) => t.id === editingId);
  const today = todayISO();
  const isDefaultView = filters.status === "Pending" && filters.assignee === "All";

  return (
    <>
      <TaskForm key={editingTask?.id ?? "new"} task={editingTask} onDone={() => setEditingId(null)} />
      <section className="card" aria-label="Filters">
        <div className="grid filters">
          <FilterBar filters={filters} onChange={setFilters} />
          <div>
            <ClearCompletedButton />
          </div>
        </div>
      </section>
      <section className="card" aria-labelledby="list-heading">
        <div className="bar">
          <h2 id="list-heading">{listHeading(state, filters)}</h2>
          <span className="count" aria-live="polite">
            {visible.length} {visible.length === 1 ? "task" : "tasks"}
          </span>
        </div>
        {visible.length > 0 ? (
          <ul className="list">
            {visible.map((task) => (
              <TaskItem key={task.id} task={task} today={today} onEdit={setEditingId} />
            ))}
          </ul>
        ) : (
          <div className="empty">
            {isDefaultView ? (
              <>
                <p>
                  <strong>No pending tasks.</strong>
                </p>
                <p>Add your first task above. Add team members in Settings to assign tasks.</p>
              </>
            ) : (
              <p>
                <strong>No tasks match these filters.</strong>
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
