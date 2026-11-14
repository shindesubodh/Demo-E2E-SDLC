import { countDone } from "../state/selectors.js";
import { useStore } from "../state/StoreContext.jsx";

export default function ClearCompletedButton() {
  const { state, dispatch } = useStore();
  const count = countDone(state);

  function clear() {
    const noun = count === 1 ? "task" : "tasks";
    if (window.confirm(`Remove ${count} completed ${noun}? This cannot be undone.`)) {
      dispatch({ type: "task/clearCompleted" });
    }
  }

  return (
    <button className="btn sec" type="button" onClick={clear} disabled={count === 0}>
      Clear completed
    </button>
  );
}
