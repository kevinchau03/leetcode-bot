import "dotenv/config";
import cron from "node-cron";
import dayjs from "dayjs";
import mongoose from "mongoose";
import { DAILY_CHANNEL_ID, DISCORD_TOKEN, MONGODB_URI} from "../config";
import { REST, Routes } from "discord.js";
import { Question } from "../models/Question";
import { DailyQuestion } from "../models/Daily";

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

async function postDaily() {
  const count = await Question.countDocuments();
  if (!count) {
    console.log("No questions available");
    return;
  }
  const random = await Question.findOne().skip(Math.floor(Math.random() * count));
  if (!random) return;

  // Idempotency: one post per day
  try {
    await DailyQuestion.create({
      questionId: random._id,
      date: dayjs().format("YYYY-MM-DD"),
    });
  } catch (e: any) {
    if (e?.code === 11000) {
      console.log("Daily already posted for today; skipping");
      return;
    }
    throw e;
  }

  const msg = `@everyone today's leetcode question is **${random.title}**: ${random.link || "(link unavailable)"}`;
  await rest.post(Routes.channelMessages(DAILY_CHANNEL_ID as string), { body: { content: msg } });

  console.log("Posted daily:", random.slug || random.title);
}

(async () => {
  if (!MONGODB_URI || !DISCORD_TOKEN || !DAILY_CHANNEL_ID) {
    throw new Error("Missing env: MONGODB_URI / DISCORD_TOKEN / DAILY_CHANNEL_ID");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Cron worker connected to MongoDB");

  // Run every day at 08:00 America/Toronto
  cron.schedule("0 8 * * *", postDaily, { timezone: "America/Toronto" });
  console.log("⏰ Cron scheduled for 08:00 America/Toronto");
})();

// Optional: graceful shutdown logs
process.on("SIGTERM", () => {
  console.log("SIGTERM — cron worker stopping");
});
