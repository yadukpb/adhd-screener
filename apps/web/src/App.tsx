import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ScreeningFlow } from "./pages/ScreeningFlow";
import { ReportPage } from "./pages/ReportPage";

export function App() {
  return (
    <div className="min-h-screen text-slate-200">
      <div className="border-b border-amber-400/20 bg-amber-400/5 px-4 py-2 text-center text-xs text-amber-300">
        Research-based screening aid. Not a diagnosis. Not clinically validated.
      </div>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/screen"
            element={
              <ProtectedRoute>
                <ScreeningFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:id"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
