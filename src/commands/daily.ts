import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { DailyQuestion } from "../models/Daily";

dayjs.extend(utc);
dayjs.extend(tz);

const TZ = process.env.TZ || "America/Toronto";
const DIFF_COLOR: Record<string, number> = { Easy: 0x2ecc71, Medium: 0xf1c40f, Hard: 0xe74c3c };

export const data = new SlashCommandBuilder()
  .setName("daily")
  .setDescription("Show today's daily LeetCode challenge.");


export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const today = dayjs().tz(TZ).format("YYYY-MM-DD");
  const q = await DailyQuestion.findOne({ date: today }).lean();

  if (!q) {
    return interaction.editReply(
      `No daily question found for **${today}** yet. (Seed one or run your daily job.)`
    );
  }

  const embed = new EmbedBuilder()
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
