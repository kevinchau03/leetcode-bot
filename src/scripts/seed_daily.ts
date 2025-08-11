// scripts/seedDaily.ts
import "dotenv/config";
import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { DailyQuestion } from "../models/Daily";
import { Question } from "../models/Question"; // <- your curated pool model

dayjs.extend(utc);
dayjs.extend(tz);

const TZ = process.env.TZ || "America/Toronto";
const today = dayjs().tz(TZ).format("YYYY-MM-DD");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    // Pick 1 random active question from problem_pool
    const [randomQ] = await Question.aggregate([
      { $match: { active: true } },
      { $sample: { size: 1 } }
    ]);

    if (!randomQ) {
      console.log("❌ No active questions found in problem_pool.");
      return;
    }

    // Create daily question doc
    const dailyQ = {
      date: today,
      slug: randomQ.slug,
      title: randomQ.title,
      difficulty: randomQ.difficulty,
      tags: randomQ.tags || [],
      link: randomQ.link
    };

    await DailyQuestion.updateOne(
      { date: today },
      { $setOnInsert: dailyQ },
      { upsert: true }
    );

    console.log(`✅ Seeded daily question for ${today}: ${dailyQ.title}`);
  } catch (e) {
    console.error("❌ Seed failed:", e);
  } finally {
    await mongoose.disconnect();
  }
})();
