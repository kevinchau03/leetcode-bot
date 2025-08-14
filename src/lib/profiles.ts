import { Profile } from "../models/Profile";

export async function getOrCreateProfile(userId: string, guildId: string) {
  return Profile.findOneAndUpdate(
    { userId, guildId },
    { $setOnInsert: { currentStreak: 0, bestStreak: 0, tz: "UTC" } },
    { upsert: true, new: true }
  ).lean();
}