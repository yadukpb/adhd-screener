import { useEffect, useRef } from "react";

export type NoiseType = "white" | "pink" | "brown";

/**
 * Synthesizes white/pink/brown noise directly via the Web Audio API -- no
 * audio asset to host or license. White is raw random samples; brown is a
 * low-pass-filtered random walk (the classic "leaky integrator"
 * approximation); pink uses Paul Kellet's refined filter bank method
 * (a standard, widely-published algorithm for approximating 1/f noise).
 * See data/references.ts#soderlund2010whitenoise and #papalambros2017pinknoise
 * for what's actually evidenced here (and what isn't -- framed honestly in
 * the UI that uses this hook, not oversold as a cure-all).
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
    } else if (type === "brown") {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5; // compensates for the gain lost by the low-pass filtering above
      }
    } else {
      // Paul Kellet's refined pink-noise filter bank.
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        data[i] = pink * 0.11;
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
