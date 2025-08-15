// cron/worker.ts
import "dotenv/config";
import cron from "node-cron";
import dayjs from "dayjs";
import mongoose from "mongoose";
import { DAILY_CHANNEL_ID, DISCORD_TOKEN, MONGODB_URI } from "../config";
import { REST, Routes } from "discord.js";
import { Question } from "../models/Question";
import { DailyQuestion } from "../models/Daily";

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

async function postDaily() {
  let count = await Question.countDocuments({ active: true });

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

  const randomIndex = Math.floor(Math.random() * count);
  const random = await Question.findOne({ active: true }).skip(randomIndex);
  if (!random) {
    console.log("Failed to find an active question");
    return;
  }

  // Idempotency: one per day
  try {
    await DailyQuestion.create({
      date: dayjs().format("YYYY-MM-DD"),
      slug: random.slug,
      title: random.title,
      difficulty: random.difficulty,
      tags: random.tags,
      link: random.link,
      questionId: random._id,
    });
  } catch (e: any) {
    if (e?.code === 11000) {
      console.log("Daily already posted for today; skipping");
      return;
    }
    throw e;
  }

  await Question.updateOne({ _id: random._id }, { $set: { active: false } });

  const msg = `@everyone today's leetcode question is **${random.title}**: ${random.link || "(link unavailable)"}\nDon't forget to use /done to log your entry for today. Best of luck! (Psst, /hint can help!)`;

  await rest.post(Routes.channelMessages(DAILY_CHANNEL_ID as string), {
    body: { content: msg },
  });

  console.log("Posted daily:", random.slug || random.title);
  console.log(`Marked question ${random.slug} as inactive`);

  const remainingActive = await Question.countDocuments({ active: true });
  console.log(`${remainingActive} active questions remaining`);
}

export async function startCron() {
  if (!MONGODB_URI || !DISCORD_TOKEN || !DAILY_CHANNEL_ID) {
    throw new Error("Missing env: MONGODB_URI / DISCORD_TOKEN / DAILY_CHANNEL_ID");
  }

  // connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Cron worker connected to MongoDB");
  }
  cron.schedule("45 12 * * *", postDaily, { timezone: "America/Toronto" });
  console.log("⏰ Cron scheduled for 12:45 America/Toronto");

  process.on("SIGTERM", () => {
    console.log("SIGTERM — cron worker stopping");
  });
}
