import { useState } from "react";
import { ERROR_MESSAGE, buildTable, parseTableNumber } from "./timesTable.js";

export default function App() {
  const [inputValue, setInputValue] = useState("");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const result = parseTableNumber(inputValue);
    if (result.ok) {
      setRows(buildTable(result.value));
      setError("");
    } else {
      setRows([]);
      setError(ERROR_MESSAGE);
    }
  }

  return (
    <main className="app">
      <h1 className="app-title">Times Table Generator</h1>
      <div className="card">
        <form className="number-form" noValidate onSubmit={handleSubmit}>
          <label className="number-label" htmlFor="number-input">
            Enter a number from 1 to 100
          </label>
          <div className="form-row">
            <input
              className="number-input"
              id="number-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              aria-invalid={error ? "true" : "false"}
              aria-describedby="error-region"
            />
            <button className="generate-button" type="submit">
              Generate
            </button>
          </div>
          <div className="error-region" id="error-region" role="alert">
            {error && (
              <p className="error-message">
                <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                  <circle cx="10" cy="10" r="9" fill="currentColor" />
                  <rect x="9" y="4.5" width="2" height="7" fill="#fff" />
                  <rect x="9" y="13" width="2" height="2" fill="#fff" />
                </svg>
                <span>{error}</span>
              </p>
            )}
          </div>
        </form>
        {rows.length > 0 && (
          <ol className="table-list" aria-label="Times table">
            {rows.map((row) => (
              <li className="table-row" key={row.multiplier}>
                {row.text}
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
