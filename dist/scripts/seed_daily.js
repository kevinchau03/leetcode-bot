"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/seedDaily.ts
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const Daily_1 = require("../models/Daily");
const Question_1 = require("../models/Question"); // <- your curated pool model
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const TZ = process.env.TZ || "America/Toronto";
const today = (0, dayjs_1.default)().tz(TZ).format("YYYY-MM-DD");
(async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        // Pick 1 random active question from problem_pool
        const [randomQ] = await Question_1.Question.aggregate([
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
        await Daily_1.DailyQuestion.updateOne({ date: today }, { $setOnInsert: dailyQ }, { upsert: true });
        console.log(`✅ Seeded daily question for ${today}: ${dailyQ.title}`);
    }
    catch (e) {
        console.error("❌ Seed failed:", e);
    }
    finally {
        await mongoose_1.default.disconnect();
    }
})();
