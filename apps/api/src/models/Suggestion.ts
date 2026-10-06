import { Schema, model, type InferSchemaType } from "mongoose";

// A user-submitted idea/suggestion about the app itself, from the coach
// widget's "Suggest something" box -- reviewed by an admin, not the AI
// (the AI never sees or acts on these; they're stored as-is for a human).
const suggestionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["new", "reviewed"], default: "new", index: true },
  },
  { timestamps: true },
);

export type SuggestionDoc = InferSchemaType<typeof suggestionSchema>;

export const SuggestionModel = model("Suggestion", suggestionSchema);
