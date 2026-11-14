import { useStore } from "../state/StoreContext.jsx";

export default function FilterBar({ filters, onChange }) {
  const { state } = useStore();
  return (
    <>
      <div>
        <label htmlFor="filter-assignee">Filter by assignee</label>
        <select
          id="filter-assignee"
          value={filters.assignee}
          onChange={(e) => onChange({ ...filters, assignee: e.target.value })}
        >
          <option value="All">All</option>
          <option value="Unassigned">Unassigned</option>
          {state.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-status">Filter by status</label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <option value="Pending">Pending</option>
          <option value="Done">Done</option>
          <option value="All">All</option>
        </select>
      </div>
    </>
  );
}
