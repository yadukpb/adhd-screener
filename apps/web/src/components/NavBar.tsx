import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass = "text-sm font-medium text-subtle transition hover:text-heading";
const mobileNavLinkClass = "block rounded-lg px-3 py-2 text-sm font-medium text-subtle transition hover-inset hover:text-heading";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-faint bg-white/70 backdrop-blur-lg dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-heading" onClick={() => setMenuOpen(false)}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 text-sm text-white">
            A
          </span>
          <span className="hidden sm:inline">ADHD Screener</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <nav className="flex items-center gap-4">
            <Link to="/about-adhd" className={navLinkClass}>
              What is ADHD?
            </Link>
            <Link to="/exercises" className={navLinkClass}>
              Exercises
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className={navLinkClass}>
                  Dashboard
                </Link>
                <Link to="/planner" className={navLinkClass}>
                  Planner
                </Link>
                <Link to="/learning-path" className={navLinkClass}>
                  My Path
                </Link>
              </>
            )}
          </nav>

          <div className="h-5 w-px bg-slate-200 dark:bg-white/10" />

          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <span className="max-w-[8rem] truncate text-sm text-faint">{user.name}</span>
              <button className="btn-secondary px-3 py-1.5 text-sm" onClick={handleLogout}>
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

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-subtle text-subtle transition hover-inset hover:text-heading"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-faint px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link to="/about-adhd" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
              What is ADHD?
            </Link>
            <Link to="/exercises" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
              Exercises
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/planner" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  Planner
                </Link>
                <Link to="/learning-path" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  My Path
                </Link>
              </>
            )}
          </nav>

          <div className="mt-3 border-t border-faint pt-3">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-faint">{user.name}</span>
                <button className="btn-secondary px-3 py-1.5 text-sm" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className={navLinkClass} onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm" onClick={() => setMenuOpen(false)}>
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
