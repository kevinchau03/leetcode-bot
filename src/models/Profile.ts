import mongoose from "mongoose";

export interface IProfile {
  userId: string;          // Discord user snowflake
  guildId: string;         // Discord guild (server) snowflake
  currentStreak: number;   // running streak
  bestStreak: number;      // all-time best
  lastCompletedDate?: string; // "YYYY-MM-DD" in your TZ (e.g., America/Toronto)
}

const profileSchema = new mongoose.Schema<IProfile>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  currentStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: String } // store date string, not Date, for TZ clarity
}, { timestamps: true });

/** One profile per (user,guild) */
profileSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const Profile = mongoose.model<IProfile>("Profile", profileSchema, "profiles");
