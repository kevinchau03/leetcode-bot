import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { Profile } from "../models/Profile";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("View server leaderboards")
  .addStringOption(option =>
    option.setName("type")
      .setDescription("Type of leaderboard")
      .setRequired(false)
      .addChoices(
        { name: "Streak", value: "streak" },
        { name: "Level", value: "level" }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const guildId = interaction.guildId!;
    const type = interaction.options.getString("type") || "streak";

    let embed: EmbedBuilder;

    switch (type) {
      case "streak":
        embed = await buildStreakLeaderboard(guildId);
        break;
      case "level":
        embed = await buildLevelLeaderboard(guildId);
        break;
      default:
        embed = await buildStreakLeaderboard(guildId);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error("Error in leaderboard command:", error);
    await interaction.editReply("An error occurred while fetching the leaderboard. Please try again later.");
  }
}

async function buildStreakLeaderboard(guildId: string): Promise<EmbedBuilder> {
  const profiles = await Profile.find({ guildId })
    .sort({ currentStreak: -1 })
    .limit(10);

  const embed = new EmbedBuilder()
    .setTitle("🔥 Current Streak Leaderboard")
    .setColor("#ff6b35");

  if (profiles.length === 0) {
    embed.setDescription("No active streaks yet! Use `/done` to start your streak.");
    return embed;
  }

  const leaderboard = profiles.map((profile, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    return `${medal} <@${profile.userId}> - **${profile.currentStreak}** days`;
  }).join("\n");

  embed.setDescription(leaderboard);
  return embed;
}

async function buildLevelLeaderboard(guildId: string): Promise<EmbedBuilder> {
  const profiles = await Profile.find({ guildId })
    .sort({ level: -1 })
    .limit(10);

  const embed = new EmbedBuilder()
    .setTitle("🏆 Highest Levels Leaderboard")
    .setColor("#ffd700");

  if (profiles.length === 0) {
    embed.setDescription("No levels recorded yet!");
    return embed;
  }

  const leaderboard = profiles.map((profile, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    return `${medal} <@${profile.userId}> - **${profile.level}**`;
  }).join("\n");

  embed.setDescription(leaderboard);
  return embed;
}