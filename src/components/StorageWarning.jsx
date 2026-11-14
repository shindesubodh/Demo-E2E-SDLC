import { useStore } from "../state/StoreContext.jsx";

export default function StorageWarning() {
  const { saveError } = useStore();
  return (
    <div role="status">
      {saveError && (
        <div className="warn">Changes could not be saved in this browser. Export your list to keep a copy.</div>
      )}
    </div>
  );
}
