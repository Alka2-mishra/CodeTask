import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export const AuthPanel = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (mode === "register") {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-copy">
        <p className="eyebrow">CodeTask</p>
        <h1>Task tracking that stays crisp on desktop and mobile.</h1>
        <p>
          Sign in to manage your work, move tasks through the pipeline, and keep everything synced in real time.
        </p>
        <div className="feature-grid">
          <article>
            <strong>Secure access</strong>
            <span>JWT auth with user-owned task data.</span>
          </article>
          <article>
            <strong>Live updates</strong>
            <span>Socket.IO keeps the board fresh without reloads.</span>
          </article>
          <article>
            <strong>Responsive layout</strong>
            <span>Optimized for phones, tablets, and large screens.</span>
          </article>
        </div>
      </div>

      <form className="auth-card" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Sign in
          </button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Create account
          </button>
        </div>

        <h2>{mode === "login" ? "Welcome back" : "Create your workspace"}</h2>
        {mode === "register" && (
          <label>
            Name
            <input value={name} onChange={event => setName(event.target.value)} placeholder="Avery Parker" required />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={8} placeholder="At least 8 characters" required />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={busy}>
          {busy ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </section>
  );
};
