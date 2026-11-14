import { useState } from "react";
import SettingsScreen from "./components/SettingsScreen.jsx";
import StorageWarning from "./components/StorageWarning.jsx";
import TaskListScreen from "./components/TaskListScreen.jsx";

const SCREENS = [
  { id: "tasks", label: "Tasks" },
  { id: "settings", label: "Settings" },
];

export default function App() {
  const [screen, setScreen] = useState("tasks");
  return (
    <>
      <header className="hdr">
        <h1>Team To-Do Tracker</h1>
        <nav className="nav" aria-label="Main">
          {SCREENS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={screen === s.id ? "page" : undefined}
              onClick={() => setScreen(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </header>
      <StorageWarning />
      <main>{screen === "tasks" ? <TaskListScreen /> : <SettingsScreen />}</main>
    </>
  );
}
