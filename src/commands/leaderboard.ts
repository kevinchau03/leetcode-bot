import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { Profile } from "../models/Profile";
import { Completion } from "../models/Completion";

export const data = new SlashCommandBuilder()
  .setName("leaderboard")
  .setDescription("View server leaderboards")
  .addStringOption(option =>
    option.setName("type")
      .setDescription("Type of leaderboard to view")
      .setRequired(false)
      .addChoices(
        { name: "Current Streak", value: "streak" },
        { name: "Best Streak", value: "best" },
        { name: "This Month", value: "month" },
        { name: "Today", value: "today" }
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
      case "best":
        embed = await buildBestStreakLeaderboard(guildId);
        break;
      case "month":
        embed = await buildMonthlyLeaderboard(guildId);
        break;
      case "today":
        embed = await buildTodayLeaderboard(guildId);
        break;
      default:
        embed = await buildStreakLeaderboard(guildId);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error("Error in leaderboard command:", error);
    // ... error handling ...
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

async function buildBestStreakLeaderboard(guildId: string): Promise<EmbedBuilder> {
  const profiles = await Profile.find({ guildId })
    .sort({ bestStreak: -1 })
    .limit(10);

  const embed = new EmbedBuilder()
    .setTitle("🏆 Best Streak Leaderboard")
    .setColor("#ffd700");

  if (profiles.length === 0) {
    embed.setDescription("No streaks recorded yet!");
    return embed;
  }

  const leaderboard = profiles.map((profile, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    return `${medal} <@${profile.userId}> - **${profile.bestStreak}** days`;
  }).join("\n");

  embed.setDescription(leaderboard);
  return embed;
}

async function buildMonthlyLeaderboard(guildId: string): Promise<EmbedBuilder> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const startDate = startOfMonth.toISOString().split("T")[0];

  const monthlyCompletions = await Completion.aggregate([
    {
      $match: {
        guildId,
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$userId",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  const embed = new EmbedBuilder()
    .setTitle("📅 This Month's Leaderboard")
    .setColor("#4ecdc4");

  if (monthlyCompletions.length === 0) {
    embed.setDescription("No completions this month yet!");
    return embed;
  }

  const leaderboard = monthlyCompletions.map((completion, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
    return `${medal} <@${completion._id}> - **${completion.count}** completed`;
  }).join("\n");

  embed.setDescription(leaderboard);
  return embed;
}

async function buildTodayLeaderboard(guildId: string): Promise<EmbedBuilder> {
  const today = new Date().toISOString().split("T")[0];

  const todayCompletions = await Completion.find({
    guildId,
    date: today
  }).sort({ completedAt: 1 });

  const embed = new EmbedBuilder()
    .setTitle("📅 Today's Completions")
    .setColor("#95e1d3");

  if (todayCompletions.length === 0) {
    embed.setDescription("No one has completed today's question yet! Be the first with `/done`");
    return embed;
  }

  const leaderboard = todayCompletions.map((completion, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "✅";
    const time = completion.timeTaken ? ` (${completion.timeTaken}m)` : "";
    return `${medal} <@${completion.userId}>${time}`;
  }).join("\n");

  embed.setDescription(leaderboard);
  embed.setFooter({ text: `${todayCompletions.length} user(s) completed today` });
  return embed;
}