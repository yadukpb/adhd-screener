import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../lib/api";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 animate-slide-up">
      <h1 className="text-2xl font-bold text-white">Create your account</h1>
      <form onSubmit={onSubmit} className="glass-card mt-6 space-y-4 p-6">
        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
        <div>
          <label className="mb-1 block text-sm text-slate-400">Name</label>
          <input className="input-field" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Email</label>
          <input className="input-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Password</label>
          <input
            className="input-field"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
