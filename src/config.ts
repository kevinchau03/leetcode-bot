import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  MONGODB_URI: process.env.MONGODB_URI,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN!;
export const MONGODB_URI = process.env.MONGODB_URI!;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!;
export const DAILY_CHANNEL_ID = process.env.DAILY_CHANNEL_ID;
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
export const TZ = process.env.TZ || "America/Toronto";
