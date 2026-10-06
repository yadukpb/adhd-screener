import { Schema, model, type InferSchemaType } from "mongoose";

// One in-progress screening per user. Each completed step (a questionnaire
// or a task) is written here immediately so a closed tab / dead battery
// mid-flow loses at most the step in progress, not everything done so far.
// Deleted once the real ScreeningSession is created from it.
const screeningDraftSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    step: { type: String, required: true },
    asrs: { type: [Number], default: undefined },
    wurs: { type: [Number], default: undefined },
    cptTrials: { type: Schema.Types.Mixed, default: undefined },
    stopTrials: { type: Schema.Types.Mixed, default: undefined },
    stopMaxRt: { type: Number, default: undefined },
    nbackTrials: { type: Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true },
);

export type ScreeningDraft = InferSchemaType<typeof screeningDraftSchema>;

export const ScreeningDraftModel = model("ScreeningDraft", screeningDraftSchema);
