import mongoose from "mongoose";

export interface ICompletion {
  userId: string;
  guildId: string;
  date: string;
  questionSlug: string;
  questionTitle: string;
  difficulty: string;
  isCurated: boolean;
  isDaily: boolean;
  completedAt: Date;
  solutionLink?: string;
  timeTaken?: number;
  notes?: string;
  pointsEarned: number;
}

const completionSchema = new mongoose.Schema<ICompletion>(
  {
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    date: { type: String, required: true },
    questionSlug: { type: String, required: true },
    questionTitle: { type: String, required: true },
    difficulty: { type: String, required: true },
    isCurated: { type: Boolean, default: false },
    isDaily: { type: Boolean, default: false },
    completedAt: { type: Date, default: Date.now },
    solutionLink: { type: String },
    timeTaken: { type: Number },
    notes: { type: String },
    pointsEarned: { type: Number, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate completions of the same question on the same day
completionSchema.index(
  { userId: 1, guildId: 1, questionSlug: 1, date: 1 },
  { unique: true }
);

export const Completion = mongoose.model<ICompletion>("Completion", completionSchema);
