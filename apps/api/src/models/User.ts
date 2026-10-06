import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // "unset" until they answer the one-time prompt on the check-in page --
    // not everyone takes medication, so this must not default to "on" and
    // show a daily took-it/didn't-take-it binary to someone it never applies to.
    medicationTracking: { type: String, enum: ["unset", "on", "off"], default: "unset" },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };

export const UserModel = model("User", userSchema);
