import { useState } from "react";
import { useNoisePlayer, type NoiseType } from "../hooks/useNoisePlayer";

const OPTIONS: { type: NoiseType; label: string; blurb: string }[] = [
  {
    type: "white",
    label: "White noise",
    blurb: "Helps attention for distractible minds, but can hurt focus for people without -- not one-size-fits-all (Soderlund et al. 2010).",
  },
  {
    type: "pink",
    label: "Pink noise",
    blurb: "Softer, bass-weighted texture. Timed pink-noise pulses during sleep helped memory in one small study -- that's a different, sleep-specific use than playing it while awake (Papalambros et al. 2017).",
  },
  {
    type: "brown",
    label: "Brown noise",
    blurb: "Deepest, often described as ocean- or waterfall-like. Same underlying stimulation principle as white noise, no separate study of its own yet.",
  },
];

export function SoothingSounds() {
  const [active, setActive] = useState<NoiseType | "none">("none");
  const [volume, setVolume] = useState(0.15);
  const noise = useNoisePlayer();

  function choose(type: NoiseType | "none") {
    setActive(type);
    if (type === "none") noise.stop();
    else noise.start(type, volume);
  }

  return (
    <div className="glass-card p-5 sm:p-6">
      <h2 className="text-lg font-bold text-heading">Need a moment?</h2>
      <p className="mt-1 text-sm text-subtle">
        Ambient sound can help you come down after something stressful -- nature sounds measurably sped up stress
        recovery in one study (Alvarsson et al. 2010). This plays synthesized noise, not recorded nature audio, but
        works on a related principle.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((o) => (
          <button
            key={o.type}
            type="button"
            onClick={() => choose(active === o.type ? "none" : o.type)}
            className={`rounded-xl border p-3 text-left text-xs transition ${
              active === o.type ? "border-brand-400 bg-brand-500/10" : "border-subtle bg-inset hover-inset"
            }`}
          >
            <p className="font-semibold text-heading">{o.label}</p>
            <p className="mt-1 leading-relaxed text-faint">{o.blurb}</p>
          </button>
        ))}
      </div>

      {active !== "none" && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-subtle">Volume</span>
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.02}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              noise.setVolume(v);
            }}
            className="w-full"
            aria-label="Volume"
          />
          <button type="button" onClick={() => choose("none")} className="shrink-0 text-xs text-faint hover:text-rose-500">
            Stop
          </button>
        </div>
      )}
    </div>
  );
}
