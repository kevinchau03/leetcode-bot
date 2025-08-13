import mongoose from "mongoose";

export interface ICompletion {
  userId: string;
  guildId: string;
  date: string;            // "YYYY-MM-DD" in your TZ
  questionSlug: string;    // slug used that day
  completedAt: Date;       // actual timestamp of check-in (UTC)
}

const completionSchema = new mongoose.Schema<ICompletion>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  date: { type: String, required: true },
  questionSlug: { type: String, required: true },
  completedAt: { type: Date, default: () => new Date() }
}, { timestamps: true });

/** Prevent double check-ins per day */
completionSchema.index({ userId: 1, guildId: 1, date: 1 }, { unique: true });

/** Useful for leaderboards/queries */
completionSchema.index({ guildId: 1, date: 1 });

export const Completion = mongoose.model<ICompletion>("Completion", completionSchema, "completions");
