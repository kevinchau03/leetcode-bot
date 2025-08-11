import "dotenv/config";
import mongoose from "mongoose";
import { MONGODB_URI } from './config';
import { Question } from "./models/Question";

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const problems = await Question.find({ active: true }).lean();
    console.log(`Found ${problems.length} active problems:`);
    console.log(problems);

    await mongoose.disconnect();
    console.log("✅ Disconnected");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
