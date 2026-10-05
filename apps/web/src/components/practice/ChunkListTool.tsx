import { useEffect, useState } from "react";
import { practiceApi, type PracticeEntry } from "../../lib/api";

export function ChunkListTool() {
  const [lists, setLists] = useState<PracticeEntry[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [chunkInput, setChunkInput] = useState("");

  useEffect(() => {
    practiceApi.list("chunk-and-externalize").then(setLists).catch(() => setLists([]));
  }, []);

  const active = lists.find((l) => (l.chunks ?? []).some((c) => !c.done));

  async function startList() {
    if (!titleInput.trim()) return;
    const entry = await practiceApi.create({ exerciseId: "chunk-and-externalize", listTitle: titleInput.trim(), chunks: [] });
    setLists((prev) => [entry, ...prev]);
    setTitleInput("");
  }

  async function addChunk() {
    if (!active || !chunkInput.trim()) return;
    const chunks = [...(active.chunks ?? []), { text: chunkInput.trim(), done: false }];
    setLists((prev) => prev.map((l) => (l._id === active._id ? { ...l, chunks } : l)));
    setChunkInput("");
    await practiceApi.update(active._id, { chunks });
  }

  async function toggleChunk(list: PracticeEntry, index: number) {
    const chunks = (list.chunks ?? []).map((c, i) => (i === index ? { ...c, done: !c.done } : c));
    setLists((prev) => prev.map((l) => (l._id === list._id ? { ...l, chunks } : l)));
    await practiceApi.update(list._id, { chunks });
  }

  return (
    <div className="mt-4 rounded-xl bg-inset p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Try it now</p>

      {!active && (
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            className="input-field flex-1 py-1.5 text-sm"
            placeholder="What are you trying to remember? (e.g. morning routine)"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <button className="btn-primary px-4 py-1.5 text-sm" disabled={!titleInput.trim()} onClick={startList}>
            Start list
          </button>
        </div>
      )}

      {active && (
        <div className="mt-2">
          <p className="text-sm font-semibold text-heading">{active.listTitle}</p>
          <ul className="mt-2 space-y-1.5">
            {(active.chunks ?? []).map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={c.done} onChange={() => toggleChunk(active, i)} className="h-4 w-4 accent-brand-500" />
                <span className={`text-sm ${c.done ? "text-faint line-through" : "text-body"}`}>{c.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              className="input-field flex-1 py-1.5 text-sm"
              placeholder="Add a chunk (3-4 words)"
              value={chunkInput}
              onChange={(e) => setChunkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addChunk()}
            />
            <button className="btn-secondary px-4 py-1.5 text-sm" disabled={!chunkInput.trim()} onClick={addChunk}>
              Add
            </button>
          </div>
        </div>
      )}

      {lists.filter((l) => l._id !== active?._id).length > 0 && (
        <div className="mt-4 border-t border-faint pt-3 text-xs text-faint">
          {lists
            .filter((l) => l._id !== active?._id)
            .slice(0, 3)
            .map((l) => (
              <p key={l._id}>
                {l.listTitle}: {(l.chunks ?? []).filter((c) => c.done).length}/{(l.chunks ?? []).length} done
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
