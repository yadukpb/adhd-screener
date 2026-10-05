import { Schema, model, type InferSchemaType } from "mongoose";

// One flexible-but-typed schema backing all 7 interactive exercise tools --
// each tool only ever populates the subset of fields relevant to it (the
// route layer enforces that per exerciseId), rather than 7 near-identical
// schemas for what's fundamentally the same "a user did a practice attempt,
// with some structured detail" shape.
const chunkItemSchema = new Schema({ text: { type: String, required: true }, done: { type: Boolean, default: false } }, { _id: false });

const practiceEntrySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    exerciseId: { type: String, required: true, index: true },

    // pause-plan (implementation intentions)
    situation: { type: String },
    action: { type: String },
    used: { type: Boolean }, // did they actually use the plan when the situation came up

    // externalized-focus-blocks
    taskName: { type: String },
    durationMinutes: { type: Number },
    doneLooksLike: { type: String },
    completedFocusBlock: { type: Boolean },
    stayedOnTask: { type: Boolean },

    // chunk-and-externalize
    listTitle: { type: String },
    chunks: { type: [chunkItemSchema], default: undefined },

    // break-it-down
    bigTask: { type: String },
    completedActions: { type: [String], default: undefined },
    nextAction: { type: String },
    taskComplete: { type: Boolean },

    // time-estimation-trainer
    estimatedMinutes: { type: Number },
    actualSeconds: { type: Number },

    // mindful-pause
    durationSeconds: { type: Number },
    noticedUrge: { type: Boolean },
    note: { type: String },

    // thought-record (situation is shared with pause-plan above)
    automaticThought: { type: String },
    evidence: { type: String },
    reframe: { type: String },
  },
  { timestamps: true },
);

export type PracticeEntryDoc = InferSchemaType<typeof practiceEntrySchema>;

export const PracticeEntryModel = model("PracticeEntry", practiceEntrySchema);
