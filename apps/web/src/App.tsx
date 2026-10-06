import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { FloatingCoachChat } from "./components/FloatingCoachChat";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ScreeningFlow } from "./pages/ScreeningFlow";
import { ReportPage } from "./pages/ReportPage";
import { LearnAboutAdhd } from "./pages/LearnAboutAdhd";
import { Exercises } from "./pages/Exercises";
import { LearningPath } from "./pages/LearningPath";
import { Planner } from "./pages/Planner";
import { Focus } from "./pages/Focus";
import { Habits } from "./pages/Habits";
import { Coach } from "./pages/Coach";

export function App() {
  return (
    <div className="min-h-screen text-body">
      <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2 text-center text-xs text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/5 dark:text-amber-300">
        Research-based screening aid. Not a diagnosis. Not clinically validated.
      </div>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about-adhd" element={<LearnAboutAdhd />} />
          <Route path="/exercises" element={<Exercises />} />
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
          <Route
            path="/learning-path"
            element={
              <ProtectedRoute>
                <LearningPath />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus"
            element={
              <ProtectedRoute>
                <Focus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute>
                <Coach />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <FloatingCoachChat />
    </div>
  );
}
