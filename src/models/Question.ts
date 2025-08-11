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

export const Question = mongoose.model("Question", questionSchema, "question_pool");

