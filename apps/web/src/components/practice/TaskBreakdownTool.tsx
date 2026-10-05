import { useEffect, useState } from "react";
import { practiceApi, type PracticeEntry } from "../../lib/api";

export function TaskBreakdownTool() {
  const [tasks, setTasks] = useState<PracticeEntry[]>([]);
  const [bigTask, setBigTask] = useState("");
  const [firstAction, setFirstAction] = useState("");
  const [nextActionInput, setNextActionInput] = useState("");

  useEffect(() => {
    practiceApi.list("break-it-down").then(setTasks).catch(() => setTasks([]));
  }, []);

  const active = tasks.find((t) => !t.taskComplete);

  async function startTask() {
    if (!bigTask.trim() || !firstAction.trim()) return;
    const entry = await practiceApi.create({
      exerciseId: "break-it-down",
      bigTask: bigTask.trim(),
      nextAction: firstAction.trim(),
      completedActions: [],
    });
    setTasks((prev) => [entry, ...prev]);
    setBigTask("");
    setFirstAction("");
  }

  async function completeStep() {
    if (!active) return;
    const completedActions = [...(active.completedActions ?? []), active.nextAction ?? ""];
    if (!nextActionInput.trim()) {
      // No more steps -- the whole task is done.
      const updated = { ...active, completedActions, taskComplete: true, nextAction: undefined };
      setTasks((prev) => prev.map((t) => (t._id === active._id ? updated : t)));
      await practiceApi.update(active._id, { completedActions, taskComplete: true });
      return;
    }
    const updated = { ...active, completedActions, nextAction: nextActionInput.trim() };
    setTasks((prev) => prev.map((t) => (t._id === active._id ? updated : t)));
    setNextActionInput("");
    await practiceApi.update(active._id, { completedActions, nextAction: nextActionInput.trim() });
  }

  return (
    <div className="mt-4 rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Try it now</p>

      {!active && (
        <div className="mt-2 space-y-2">
          <input
            className="input-field py-1.5 text-sm"
            placeholder="The task that feels too big (e.g. clean the kitchen)"
            value={bigTask}
            onChange={(e) => setBigTask(e.target.value)}
          />
          <input
            className="input-field py-1.5 text-sm"
            placeholder="The smallest first physical action"
            value={firstAction}
            onChange={(e) => setFirstAction(e.target.value)}
          />
          <button className="btn-primary px-4 py-1.5 text-sm" disabled={!bigTask.trim() || !firstAction.trim()} onClick={startTask}>
            Start
          </button>
        </div>
      )}

      {active && (
        <div className="mt-2">
          <p className="text-sm font-semibold text-heading">{active.bigTask}</p>
          {(active.completedActions ?? []).length > 0 && (
            <ul className="mt-2 space-y-1">
              {(active.completedActions ?? []).map((a, i) => (
                <li key={i} className="text-sm text-faint line-through">
                  {a}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 rounded-lg border border-subtle bg-white p-3 dark:bg-white/5">
            <p className="text-xs text-subtle">Right now, just do:</p>
            <p className="text-sm font-medium text-heading">{active.nextAction}</p>
          </div>
          <input
            className="input-field mt-2 py-1.5 text-sm"
            placeholder="Next small action (leave blank if the task is fully done)"
            value={nextActionInput}
            onChange={(e) => setNextActionInput(e.target.value)}
          />
          <button className="btn-primary mt-2 px-4 py-1.5 text-sm" onClick={completeStep}>
            {nextActionInput.trim() ? "Done -- set next step" : "Done -- mark task complete"}
          </button>
        </div>
      )}

      {tasks.filter((t) => t.taskComplete).length > 0 && (
        <p className="mt-4 border-t border-faint pt-3 text-xs text-faint">
          {tasks.filter((t) => t.taskComplete).length} task{tasks.filter((t) => t.taskComplete).length === 1 ? "" : "s"} fully broken
          down and finished.
        </p>
      )}
    </div>
  );
}
