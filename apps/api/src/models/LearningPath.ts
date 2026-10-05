import { Schema, model, type InferSchemaType } from "mongoose";

const pathStepSchema = new Schema(
  {
    key: { type: String, required: true },
    type: { type: String, enum: ["learn", "practice"], required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    anchor: { type: String }, // present for type "learn"
    exerciseId: { type: String }, // present for type "practice"
    status: { type: String, enum: ["pending", "done"], default: "pending" },
    completedAt: { type: Date },
  },
  { _id: false },
);

const learningPathSchema = new Schema(
  {
    // One rolling path per user -- regenerated/merged after every
    // screening rather than keeping a separate path per session, so
    // progress accumulates instead of resetting each time.
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    sourceSession: { type: Schema.Types.ObjectId, ref: "ScreeningSession", required: true },
    steps: { type: [pathStepSchema], required: true },
  },
  { timestamps: true },
);

export type LearningPathDoc = InferSchemaType<typeof learningPathSchema>;

export const LearningPathModel = model("LearningPath", learningPathSchema);
