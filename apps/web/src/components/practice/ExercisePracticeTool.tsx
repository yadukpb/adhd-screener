import type { ReactElement } from "react";
import { PausePlanTool } from "./PausePlanTool";
import { FocusTimerTool } from "./FocusTimerTool";
import { ChunkListTool } from "./ChunkListTool";
import { TaskBreakdownTool } from "./TaskBreakdownTool";
import { TimeEstimationTool } from "./TimeEstimationTool";
import { MindfulPauseTool } from "./MindfulPauseTool";
import { ThoughtRecordTool } from "./ThoughtRecordTool";

const TOOLS: Record<string, () => ReactElement> = {
  "pause-plan": PausePlanTool,
  "externalized-focus-blocks": FocusTimerTool,
  "chunk-and-externalize": ChunkListTool,
  "break-it-down": TaskBreakdownTool,
  "time-estimation-trainer": TimeEstimationTool,
  "mindful-pause": MindfulPauseTool,
  "thought-record": ThoughtRecordTool,
};

export function ExercisePracticeTool({ exerciseId }: { exerciseId: string }) {
  const Tool = TOOLS[exerciseId];
  if (!Tool) return null; // an exercise without a built interactive tool yet -- falls back to the written steps only
  return <Tool />;
}
