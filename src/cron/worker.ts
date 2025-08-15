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
  // Only count active questions
  let count = await Question.countDocuments({ active: true });
  
  // If no active questions, reactivate all questions
  if (!count) {
    console.log("No active questions available, reactivating all questions...");
    await Question.updateMany({}, { $set: { active: true } });
    count = await Question.countDocuments({ active: true });
    console.log(`Reactivated ${count} questions`);
    
    if (!count) {
      console.log("No questions available in database");
      return;
    }
  }
  
  // Pick a random active question
  const randomIndex = Math.floor(Math.random() * count);
  const random = await Question.findOne({ active: true }).skip(randomIndex);
  if (!random) {
    console.log("Failed to find an active question");
    return;
  }

  // Idempotency: one post per day
  try {
    await DailyQuestion.create({
      date: dayjs().format("YYYY-MM-DD"),
      slug: random.slug,
      title: random.title,
      difficulty: random.difficulty,
      tags: random.tags,
      link: random.link,
      questionId: random._id
    });
  } catch (e: any) {
    if (e?.code === 11000) {
      console.log("Daily already posted for today; skipping");
      return;
    }
    throw e;
  }

  // Mark the question as inactive to avoid repeats
  await Question.updateOne(
    { _id: random._id },
    { $set: { active: false } }
  );

  const msg = `@everyone today's leetcode question is **${random.title}**: ${random.link || "(link unavailable)"}`;
  await rest.post(Routes.channelMessages(DAILY_CHANNEL_ID as string), { body: { content: msg } });

  console.log("Posted daily:", random.slug || random.title);
  console.log(`Marked question ${random.slug} as inactive`);
  
  // Log remaining active questions
  const remainingActive = await Question.countDocuments({ active: true });
  console.log(`${remainingActive} active questions remaining`);
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
