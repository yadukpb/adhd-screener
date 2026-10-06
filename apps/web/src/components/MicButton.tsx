import { useRef, useState } from "react";
import { chatApi, ApiError } from "../lib/api";
import { IconMic, IconSquare } from "./icons";

const MAX_RECORDING_MS = 120_000; // 2 minutes -- plenty for a chat message, bounds upload size and Groq usage

// Chrome only ever records webm; Safari only ever records mp4/aac. Try the
// modern explicit options first, fall back to the browser's own default
// (passing no mimeType at all) rather than failing outright on a browser
// that supports MediaRecorder but not any of these specific strings.
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mp4;codecs=mp4a.40.2", "audio/aac"];

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) return undefined;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
}

export function isVoiceInputSupported(): boolean {
  return typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export function MicButton({ onTranscribed, disabled }: { onTranscribed: (text: string) => void; disabled?: boolean }) {
  const [status, setStatus] = useState<"idle" | "recording" | "transcribing">("idle");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!isVoiceInputSupported()) return null;

  function cleanupStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
  }

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        cleanupStream();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size === 0) {
          setStatus("idle");
          return;
        }
        setStatus("transcribing");
        try {
          const { text } = await chatApi.transcribe(blob);
          onTranscribed(text);
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Couldn't transcribe that. Try typing instead.");
        } finally {
          setStatus("idle");
        }
      };

      recorder.start();
      setStatus("recording");
      maxTimerRef.current = setTimeout(() => {
        if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      }, MAX_RECORDING_MS);
    } catch {
      setError("Couldn't access your microphone -- check your browser's permission for this site.");
      cleanupStream();
      setStatus("idle");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        disabled={disabled || status === "transcribing"}
        onClick={status === "recording" ? stop : start}
        aria-label={status === "recording" ? "Stop recording" : "Record a voice message"}
        title={error ?? undefined}
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition disabled:opacity-50 ${
          status === "recording"
            ? "animate-pulse bg-rose-500 text-white"
            : "border border-subtle bg-inset text-body hover-inset"
        }`}
      >
        {status === "recording" ? (
          <IconSquare size={16} />
        ) : status === "transcribing" ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <IconMic size={18} />
        )}
      </button>
      {error && (
        <p className="absolute bottom-full right-0 mb-1.5 w-48 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs text-white shadow-lg">{error}</p>
      )}
    </div>
  );
}
