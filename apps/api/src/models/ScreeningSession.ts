import { Schema, model, type InferSchemaType } from "mongoose";

const cptSummarySchema = new Schema(
  {
    nGo: Number,
    nNoGo: Number,
    omissionPct: Number,
    commissionPct: Number,
    meanRt: Number,
    rtSd: Number,
    tau: Number,
    dPrime: Number,
  },
  { _id: false },
);

const stopSummarySchema = new Schema(
  {
    valid: Boolean,
    ssrt: Number,
    pRespondGivenStop: Number,
    meanGoRt: Number,
    meanSsd: Number,
  },
  { _id: false },
);

const nbackSummarySchema = new Schema(
  {
    hits: Number,
    misses: Number,
    falseAlarms: Number,
    correctRejections: Number,
    dPrime: Number,
  },
  { _id: false },
);

// Indicators are stored as the computed snapshot at report time (Mixed,
// mirrored by the core `Indicator[]` type in application code) so a
// person's history stays stable even if norms.ts is later refined.
const indicatorSchema = new Schema({}, { _id: false, strict: false });

const screeningSessionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    asrs: { type: [Number], default: undefined },
    wurs: { type: [Number], default: undefined },
    cpt: { type: cptSummarySchema, default: undefined },
    stop: { type: stopSummarySchema, default: undefined },
    nback: { type: nbackSummarySchema, default: undefined },
    indicators: { type: [indicatorSchema], required: true },
  },
  { timestamps: true },
);

export type ScreeningSessionDoc = InferSchemaType<typeof screeningSessionSchema>;

export const ScreeningSessionModel = model("ScreeningSession", screeningSessionSchema);
