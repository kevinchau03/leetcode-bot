"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
// src/models/Question.ts
const mongoose_1 = __importDefault(require("mongoose"));
const questionSchema = new mongoose_1.default.Schema({
    slug: String,
    title: String,
    difficulty: String,
    tags: [String],
    link: String,
    active: Boolean
});
questionSchema.index({ slug: 1 }, { unique: true }); // ensures slug is unique
questionSchema.index({ active: 1 }); // for faster queries on active status
exports.Question = mongoose_1.default.model("Question", questionSchema, "question_pool");
