import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { getOrCreateProfile } from "../lib/profiles";
import { Completion } from "../models/Completion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("View your LeetCode profile and stats")
  .addUserOption(option =>
    option.setName("user")
      .setDescription("View another user's profile")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser("user") || interaction.user;
    const userId = targetUser.id;
    const guildId = interaction.guildId!;

    await showStatsOverview(interaction, userId, guildId, targetUser);

  } catch (error) {
    console.error("Error in profile command:", error);
    const errorMsg = "❌ An error occurred while fetching your profile.";
    
    if (interaction.deferred) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  }
}

async function showStatsOverview(interaction: ChatInputCommandInteraction, userId: string, guildId: string, targetUser: any) {
  const profile = await getOrCreateProfile(userId, guildId);
  
  // Get completion statistics
  const totalCompletions = await Completion.countDocuments({ userId, guildId });
  const thisMonthStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const monthlyCompletions = await Completion.countDocuments({
    userId,
    guildId,
    date: { $gte: thisMonthStart }
  });

  // Get difficulty breakdown
  const completions = await Completion.find({ userId, guildId }).populate('questionSlug');
  
  // Since we don't have direct difficulty in completions, we'll get unique questions and count
  const uniqueQuestions = [...new Set(completions.map(c => c.questionSlug))];
  
  // Get recent activity (last 7 days)
  const sevenDaysAgo = dayjs().subtract(7, 'days').format('YYYY-MM-DD');
  const recentCompletions = await Completion.countDocuments({
    userId,
    guildId,
    date: { $gte: sevenDaysAgo }
  });

  // Calculate average time (if available)
  const completionsWithTime = completions.filter(c => c.timeTaken);
  const avgTime = completionsWithTime.length > 0 
    ? Math.round(completionsWithTime.reduce((sum, c) => sum + c.timeTaken!, 0) / completionsWithTime.length)
    : null;

  const isOwnProfile = interaction.user.id === userId;
  const displayName = isOwnProfile ? "Your" : `${targetUser.displayName}'s`;

    const embed = new EmbedBuilder()
    .setTitle(`📊 ${displayName} LeetCode Profile`)
    .setColor("#ADD8E6")
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields([
      {
        name: "⭐ Level",
        value: `${profile.level}`,
        inline: true
      },
      {
        name: "💎 Experience",
        value: `${profile.exp || 0} XP`,
        inline: true
      },
      {
        name: "� Total Problems",
        value: `${totalCompletions}`,
        inline: true
      },
      
      // Streak section - full width for emphasis
      { 
        name: "🔥 Streak Performance", 
        value: `**Current Streak:** ${profile.currentStreak} days\n**Best Streak:** ${profile.bestStreak} days`, 
        inline: false 
      },
      
      // Activity metrics - inline again
      { 
        name: "📅 This Month", 
        value: `${monthlyCompletions} problems`, 
        inline: true 
      },
      { 
        name: "� Last 7 Days", 
        value: `${recentCompletions} problems`, 
        inline: true 
      },
      { 
        name: "⏰ Last Active", 
        value: profile.lastCompletedDate || 'Never', 
        inline: true 
      }
    ]);

  if (avgTime) {
    embed.addFields([
      { name: "⏱️ Average Time", value: `${avgTime} minutes`, inline: true }
    ]);
  }

  if (profile.tz) {
    embed.addFields([
      { name: "🌍 Timezone", value: profile.tz, inline: true }
    ]);
  }
}