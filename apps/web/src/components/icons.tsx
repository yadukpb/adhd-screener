// Small hand-written icon set, no library dependency. Shared between
// Landing.tsx and LearnAboutAdhd.tsx so the same visual language (and the
// same SVG code) isn't duplicated across pages.
import type { ReactNode } from "react";

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function IconClipboard(props: { size?: number }) {
  return (
    <Svg {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h6M9 19h3" />
    </Svg>
  );
}
export function IconCpu(props: { size?: number }) {
  return (
    <Svg {...props}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </Svg>
  );
}
export function IconTrend(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M3 17l6-6 4 4 7-8" />
      <path d="M15 7h5v5" />
    </Svg>
  );
}
export function IconChat(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.4 8.6 8.6 0 0 1-4-1L3 20l1.1-5.5a8.38 8.38 0 0 1-1-4A8.4 8.4 0 0 1 11.5 3a8.38 8.38 0 0 1 8.4 8.4" />
    </Svg>
  );
}
export function IconUsers(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}
export function IconSplit(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M16 21h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </Svg>
  );
}
export function IconHeart(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </Svg>
  );
}
export function IconSparkle(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </Svg>
  );
}
export function IconDna(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M6 3c0 6 12 6 12 12M18 21c0-6-12-6-12-12" />
      <path d="M7 6h3M14 10h3M7 14h3M14 18h3" />
    </Svg>
  );
}
export function IconStethoscope(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M5 4v6a4 4 0 0 0 8 0V4M9 20a4 4 0 0 0 4-4v-2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M13 14a4 4 0 0 0 4-4" />
    </Svg>
  );
}
export function IconPuzzle(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M10 3h3a1 1 0 0 1 1 1v2.1a1.9 1.9 0 1 0 0 3.8V12a1 1 0 0 1-1 1h-2.1a1.9 1.9 0 1 0-3.8 0H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.1a1.9 1.9 0 1 0 3.8 0V4a1 1 0 0 1 1-1Z" />
    </Svg>
  );
}
export function IconPill(props: { size?: number }) {
  return (
    <Svg {...props}>
      <rect x="3" y="10.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 14)" />
      <path d="M8 13l3 3" />
    </Svg>
  );
}
export function IconLightbulb(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
    </Svg>
  );
}
export function IconCalendar(props: { size?: number }) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </Svg>
  );
}
export function IconTimer(props: { size?: number }) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6" />
    </Svg>
  );
}
export function IconArrowRight(props: { size?: number }) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}
