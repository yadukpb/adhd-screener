import { Schema, model, type InferSchemaType } from "mongoose";

export const TASK_COLORS = ["blue", "green", "purple", "amber", "rose"] as const;

// date is stored as "YYYY-MM-DD" (the person's local calendar day), not a
// Date -- a visual day planner cares about which day a task is ON, not a
// precise instant, and that sidesteps timezone drift entirely.
const dailyTaskSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/, index: true },
    title: { type: String, required: true, trim: true },
    time: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d$/ }, // "HH:MM", optional
    color: { type: String, enum: TASK_COLORS, default: "blue" },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
);

dailyTaskSchema.index({ user: 1, date: 1 });

export type DailyTaskDoc = InferSchemaType<typeof dailyTaskSchema>;

export const DailyTaskModel = model("DailyTask", dailyTaskSchema);
