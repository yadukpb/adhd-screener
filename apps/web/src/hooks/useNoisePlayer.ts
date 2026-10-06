import { useEffect, useRef } from "react";

export type NoiseType = "white" | "brown";

/**
 * Synthesizes white/brown noise directly via the Web Audio API -- no audio
 * asset to host or license, just random samples (white) or a simple
 * low-pass-filtered random walk (brown, the classic "leaky integrator"
 * approximation) looped through a GainNode. See
 * data/references.ts#soderlund2010whitenoise for why this exists and its
 * caveat (helps inattentive listeners, can hurt attentive ones).
 */
export function useNoisePlayer() {
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  function stop() {
    sourceRef.current?.stop();
    sourceRef.current = null;
    gainRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }

  function start(type: NoiseType, volume: number) {
    stop();
    const ctx = new AudioContext();
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5; // compensates for the gain lost by the low-pass filtering above
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();

    ctxRef.current = ctx;
    sourceRef.current = source;
    gainRef.current = gain;
  }

  function setVolume(volume: number) {
    if (gainRef.current) gainRef.current.gain.value = volume;
  }

  useEffect(() => stop, []);

  return { start, stop, setVolume };
}
