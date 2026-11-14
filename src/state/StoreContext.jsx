import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { loadState, saveState } from "../lib/storage.js";
import { reducer } from "./reducer.js";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const result = saveState(state);
    setSaveError(result.ok ? null : result.error);
  }, [state]);

  return <StoreContext.Provider value={{ state, dispatch, saveError }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
