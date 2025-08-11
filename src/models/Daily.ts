// models/DailyQuestion.ts
import mongoose from "mongoose";

const dailySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // format "YYYY-MM-DD"
  slug: String,
  title: String,
  difficulty: String,
  tags: [String],
  link: String,
  active: Boolean
});

export const DailyQuestion = mongoose.model(
  "DailyQuestion",
  dailySchema,
  "daily_questions"
);
