"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const discord_js_1 = require("discord.js");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const Daily_1 = require("../models/Daily");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
const TZ = process.env.TZ || "America/Toronto";
const DIFF_COLOR = { Easy: 0x2ecc71, Medium: 0xf1c40f, Hard: 0xe74c3c };
async function execute(interaction) {
    await interaction.deferReply();
    const today = (0, dayjs_1.default)().tz(TZ).format("YYYY-MM-DD");
    const q = await Daily_1.DailyQuestion.findOne({ date: today }).lean();
    if (!q) {
        return interaction.editReply(`No daily question found for **${today}** yet. (Seed one or run your daily job.)`);
    }
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle(`${q.title} (${q.difficulty})`)
        .setURL(q.link ?? null)
        .setColor(DIFF_COLOR[String(q.difficulty)] ?? 0x5865f2)
        .setDescription([
        `**Date:** ${q.date}`,
        q.tags?.length ? `**Tags:** ${q.tags.join(", ")}` : undefined
    ].filter(Boolean).join("\n"))
        .setFooter({ text: "Good luck! Keep that streak alive ⚡" });
    await interaction.editReply({ embeds: [embed] });
}
