import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/70 backdrop-blur-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-white">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-sm">
            A
          </span>
          ADHD Screener
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white">
                Dashboard
              </Link>
              <span className="text-sm text-slate-500">{user.name}</span>
              <button
                className="btn-secondary px-3 py-1.5 text-sm"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-300 hover:text-white">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
