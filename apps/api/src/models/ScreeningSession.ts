import { Schema, model, type InferSchemaType } from "mongoose";

// Mongoose's Number SchemaType hard-rejects NaN (throws a CastError), but
// @adhd-screener/core legitimately produces NaN for these derived fields
// when there's not enough data (e.g. a go/no-go task where every go trial
// was missed -- confirmed live: it crashed the whole session save instead
// of storing what we actually have). computeIndicators()/the UI already
// treat NaN as a "not enough data" sentinel via Number.isFinite checks, so
// these use Mixed to store it as-is rather than losing the real value or
// failing the write; plain counts (nGo, hits, etc.) are always well-defined
// integers and stay as Number.
const flexibleFloat = Schema.Types.Mixed;

const cptSummarySchema = new Schema(
  {
    nGo: Number,
    nNoGo: Number,
    omissionPct: flexibleFloat,
    commissionPct: flexibleFloat,
    meanRt: flexibleFloat,
    rtSd: flexibleFloat,
    tau: flexibleFloat,
    dPrime: flexibleFloat,
  },
  { _id: false },
);

const stopSummarySchema = new Schema(
  {
    valid: Boolean,
    ssrt: flexibleFloat,
    pRespondGivenStop: flexibleFloat,
    meanGoRt: flexibleFloat,
    meanSsd: flexibleFloat,
  },
  { _id: false },
);

const nbackSummarySchema = new Schema(
  {
    hits: Number,
    misses: Number,
    falseAlarms: Number,
    correctRejections: Number,
    dPrime: flexibleFloat,
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
    emotionalDyscontrol: { type: [Number], default: undefined },
    cpt: { type: cptSummarySchema, default: undefined },
    stop: { type: stopSummarySchema, default: undefined },
    nback: { type: nbackSummarySchema, default: undefined },
    indicators: { type: [indicatorSchema], required: true },
  },
  { timestamps: true },
);

export type ScreeningSessionDoc = InferSchemaType<typeof screeningSessionSchema>;

export const ScreeningSessionModel = model("ScreeningSession", screeningSessionSchema);
