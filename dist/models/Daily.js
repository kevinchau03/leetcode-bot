"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DailyQuestion = void 0;
// models/DailyQuestion.ts
const mongoose_1 = __importDefault(require("mongoose"));
const dailySchema = new mongoose_1.default.Schema({
    date: { type: String, required: true, unique: true }, // format "YYYY-MM-DD"
    slug: String,
    title: String,
    difficulty: String,
    tags: [String],
    link: String,
    active: Boolean
});
exports.DailyQuestion = mongoose_1.default.model("DailyQuestion", dailySchema, "daily_questions");
