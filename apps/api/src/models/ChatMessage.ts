import { Schema, model, type InferSchemaType } from "mongoose";

// Every turn of every chat (coach and per-session results chat alike) as
// its own document, so a conversation survives a page refresh / reopening
// the floating widget instead of starting over each time.
const chatMessageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mode: { type: String, enum: ["coach", "results"], required: true },
    // Only set for mode "results" -- which screening report the thread is attached to.
    session: { type: Schema.Types.ObjectId, ref: "ScreeningSession" },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

chatMessageSchema.index({ user: 1, mode: 1, session: 1, createdAt: 1 });

export type ChatMessageDoc = InferSchemaType<typeof chatMessageSchema>;

export const ChatMessageModel = model("ChatMessage", chatMessageSchema);
