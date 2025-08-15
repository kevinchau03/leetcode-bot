import { Schema, model } from "mongoose";

const CompletionSchema = new Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  questionSlug: { type: String, required: true },
  completedAt: { type: Date, default: Date.now },
  solutionLink: { type: String }, // Optional GitHub/LeetCode link
  timeTaken: { type: Number }, // Minutes taken to solve
  difficultyRating: { type: Number, min: 1, max: 5 }, // Personal difficulty rating
  notes: { type: String }, // Optional notes
});

// Compound index to prevent duplicate completions
CompletionSchema.index({ userId: 1, guildId: 1, date: 1 }, { unique: true });

export const Completion = model("Completion", CompletionSchema);
