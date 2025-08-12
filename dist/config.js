"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TZ = exports.DAILY_CHANNEL_ID = exports.MONGODB_URI = exports.DISCORD_TOKEN = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DISCORD_TOKEN = process.env.DISCORD_TOKEN;
exports.MONGODB_URI = process.env.MONGODB_URI;
exports.DAILY_CHANNEL_ID = process.env.DAILY_CHANNEL_ID;
exports.TZ = process.env.TZ || "America/Toronto";
