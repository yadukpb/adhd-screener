import { Schema, model, type InferSchemaType } from "mongoose";

// One entry per user per calendar day (date as "YYYY-MM-DD", same reasoning
// as DailyTask -- a daily check-in cares about which day, not an instant).
// All fields optional: someone who doesn't take medication just never sets
// medicationTaken, and the UI doesn't treat that as a failure to log.
const habitLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    medicationTaken: { type: Boolean },
    mood: { type: Number, min: 1, max: 5 },
    sleepHours: { type: Number, min: 0, max: 24 },
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

habitLogSchema.index({ user: 1, date: 1 }, { unique: true });

export type HabitLogDoc = InferSchemaType<typeof habitLogSchema>;

export const HabitLogModel = model("HabitLog", habitLogSchema);
