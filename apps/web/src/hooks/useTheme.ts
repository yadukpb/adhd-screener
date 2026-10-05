import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

function readInitialTheme(): Theme {
  // index.html's inline script already set the .dark class before paint;
  // just mirror whatever it decided rather than re-deriving it, so the
  // toggle's displayed state can never disagree with what's on screen.
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Private browsing / blocked storage -- the toggle still works for
      // this page view, it just won't persist. Not worth failing over.
    }
  }, [theme]);

  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}
