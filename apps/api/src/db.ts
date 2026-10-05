import mongoose from "mongoose";

export async function connectDb(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  // eslint-disable-next-line no-console
  console.log(`[db] connected to ${new URL(uri).host}${new URL(uri).pathname}`);
}
