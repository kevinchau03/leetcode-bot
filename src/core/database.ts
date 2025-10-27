import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI environment variable is not defined.");
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}