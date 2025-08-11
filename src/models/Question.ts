// src/models/Question.ts
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  slug: String,
  title: String,
  difficulty: String,
  tags: [String],
  link: String,
  active: Boolean
});

questionSchema.index({ slug: 1 }, { unique: true }); // ensures slug is unique
questionSchema.index({ active: 1 }); // for faster queries on active status

export const Question = mongoose.model("Question", questionSchema, "question_pool");

