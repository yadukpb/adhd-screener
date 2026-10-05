import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass = "text-sm font-medium text-subtle transition hover:text-heading";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b border-faint bg-white/70 backdrop-blur-lg dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-heading">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-sm text-white">
            A
          </span>
          <span className="hidden sm:inline">ADHD Screener</span>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4">
            <Link to="/about-adhd" className={navLinkClass}>
              What is ADHD?
            </Link>
            <Link to="/exercises" className={navLinkClass}>
              Exercises
            </Link>
            {user && (
              <Link to="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
            )}
          </nav>

          <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-faint sm:inline">{user.name}</span>
              <button
                className="btn-secondary px-3 py-1.5 text-sm"
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className={navLinkClass}>
                Sign in
              </Link>
              <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
