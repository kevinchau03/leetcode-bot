"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const Question_1 = require("./models/Question");
(async () => {
    try {
        await mongoose_1.default.connect(config_1.MONGODB_URI);
        console.log("✅ Connected to MongoDB");
        const problems = await Question_1.Question.find({ active: true }).lean();
        console.log(`Found ${problems.length} active problems:`);
        console.log(problems);
        await mongoose_1.default.disconnect();
        console.log("✅ Disconnected");
    }
    catch (err) {
        console.error("❌ Error:", err);
    }
})();
