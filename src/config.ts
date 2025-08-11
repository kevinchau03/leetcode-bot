import dotenv from "dotenv";
dotenv.config();

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const DAILY_CHANNEL_ID = process.env.DAILY_CHANNEL_ID!;
export const TZ = process.env.TZ || "America/Toronto";
