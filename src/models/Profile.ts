import mongoose from "mongoose";

export interface IProfile {
  userId: string;          
  guildId: string;         
  currentStreak: number;   
  bestStreak: number;      
  lastCompletedDate?: string;
  tz?: string;
}

const profileSchema = new mongoose.Schema<IProfile>({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  currentStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: String }, // store date string, not Date, for TZ clarity
  tz: { type: String } // Timezone string (e.g., "America/Toronto")
}, { timestamps: true });

/** One profile per (user,guild) */
profileSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export const Profile = mongoose.model<IProfile>("Profile", profileSchema, "profiles");
