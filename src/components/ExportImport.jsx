import { useState } from "react";
import { exportToFile, readImportFile } from "../lib/fileTransfer.js";
import { useStore } from "../state/StoreContext.jsx";

function plural(count, noun) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

export default function ExportImport() {
  const { state, dispatch } = useStore();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function handleFile(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file) return;
    setError(null);
    setMessage(null);
    const result = await readImportFile(file);
    input.value = "";
    if (!result.ok) {
      setError(`${result.error} Your current list is unchanged.`);
      return;
    }
    const confirmed = window.confirm(
      `Replace your current list? Importing replaces all ${plural(state.tasks.length, "task")} and ` +
        `${plural(state.members.length, "team member")} on this device with the contents of ${file.name}. ` +
        "This cannot be undone.",
    );
    if (!confirmed) return;
    dispatch({ type: "data/replace", payload: { data: result.data } });
    setMessage(
      `Imported ${plural(result.data.tasks.length, "task")} and ${plural(result.data.members.length, "team member")}.`,
    );
  }

  return (
    <section className="card" aria-labelledby="transfer-heading">
      <h2 id="transfer-heading">Export and import</h2>
      <p className="hint">
        Export saves all tasks and members as a JSON file. Import replaces the current list after a warning.
      </p>
      <div className="grid">
        <div>
          <button className="btn" type="button" onClick={() => exportToFile(state)}>
            Export to file
          </button>
        </div>
        <div>
          <label htmlFor="import-file">Import from file</label>
          <input
            id="import-file"
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            aria-describedby={error ? "import-error" : undefined}
          />
          {error && (
            <div className="err" id="import-error" role="alert">
              {error}
            </div>
          )}
          <div role="status" className="hint">
            {message}
          </div>
        </div>
      </div>
    </section>
  );
}
