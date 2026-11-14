import { useState } from "react";
import { MAX_MEMBERS, MAX_NAME } from "../lib/storage.js";
import { addMember } from "../state/actions.js";
import { addMemberError, memberNameError } from "../state/reducer.js";
import { useStore } from "../state/StoreContext.jsx";

function MemberRow({ member }) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(member.name);
  const [error, setError] = useState(null);
  const inputId = `member-${member.id}`;
  const errorId = `${inputId}-error`;

  function rename(event) {
    event.preventDefault();
    const message = memberNameError(state.members, name, member.id);
    setError(message);
    if (!message) dispatch({ type: "member/rename", payload: { id: member.id, name } });
  }

  function remove() {
    if (window.confirm(`Remove ${member.name}? Their tasks will show as Unassigned.`)) {
      dispatch({ type: "member/remove", payload: { id: member.id } });
    }
  }

  return (
    <li>
      <form className="mrow" onSubmit={rename} noValidate>
        <div className="grow">
          <label htmlFor={inputId}>
            Name<span className="visually-hidden"> of {member.name}</span>
          </label>
          <input
            id={inputId}
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? errorId : undefined}
          />
          {error && (
            <div className="err" id={errorId} role="alert">
              {error}
            </div>
          )}
        </div>
        <button className="btn sec" type="submit" aria-label={`Rename ${member.name}`}>
          Rename
        </button>
        <button className="btn link del" type="button" onClick={remove} aria-label={`Remove ${member.name}`}>
          Remove
        </button>
      </form>
    </li>
  );
}

export default function MemberManager() {
  const { state, dispatch } = useStore();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  function add(event) {
    event.preventDefault();
    const message = addMemberError(state.members, name);
    setError(message);
    if (message) return;
    dispatch(addMember(name));
    setName("");
  }

  return (
    <section className="card" aria-labelledby="members-heading">
      <h2 id="members-heading">
        Team members ({state.members.length}/{MAX_MEMBERS})
      </h2>
      <form className="mrow" onSubmit={add} noValidate>
        <div className="grow">
          <label htmlFor="new-member">New member name</label>
          <input
            id="new-member"
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? "new-member-error" : undefined}
          />
        </div>
        <button className="btn" type="submit">
          Add
        </button>
      </form>
      {error && (
        <div className="err" id="new-member-error" role="alert">
          {error}
        </div>
      )}
      {state.members.length > 0 && (
        <ul className="list members">
          {state.members.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
        </ul>
      )}
      <p className="hint">Removing a member shows their tasks as Unassigned.</p>
    </section>
  );
}
