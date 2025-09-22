// commands/profile.ts
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
  .addStringOption(option =>
    option.setName("view")
      .setDescription("What to display")
      .setRequired(false)
      .addChoices(
        { name: "Stats Overview", value: "stats" },
        { name: "Completion History", value: "history" }
      )
  )
  .addUserOption(option =>
    option.setName("user")
      .setDescription("View another user's profile")
      .setRequired(false)
  )
  .addIntegerOption(option =>
    option.setName("page")
      .setDescription("Page number for history view")
      .setRequired(false)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const viewType = interaction.options.getString("view") || "stats";
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const page = interaction.options.getInteger("page") || 1;
    const userId = targetUser.id;
    const guildId = interaction.guildId!;

    if (viewType === "history") {
      await showCompletionHistory(interaction, userId, guildId, targetUser, page);
    } else {
      await showStatsOverview(interaction, userId, guildId, targetUser);
    }

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
    .setColor("#00d4aa")
    .setThumbnail(targetUser.displayAvatarURL())
    .addFields([
      { 
        name: "🔥 Streak Stats", 
        value: `**Current:** ${profile.currentStreak} days\n**Best:** ${profile.bestStreak} days`, 
        inline: true 
      },
      { 
        name: "📈 Completion Stats", 
        value: `**Total:** ${totalCompletions} problems\n**This Month:** ${monthlyCompletions} problems`, 
        inline: true 
      },
      { 
        name: "📅 Activity", 
        value: `**Last 7 Days:** ${recentCompletions} problems\n**Last Completed:** ${profile.lastCompletedDate || 'Never'}`, 
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

  // Add button to view history
  const historyButton = new ButtonBuilder()
    .setCustomId(`profile_history_${userId}_1`)
    .setLabel("📚 View History")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(historyButton);

  await interaction.editReply({ 
    embeds: [embed],
    components: totalCompletions > 0 ? [row] : []
  });
}

async function showCompletionHistory(interaction: ChatInputCommandInteraction, userId: string, guildId: string, targetUser: any, page: number) {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  // Get total count for pagination
  const totalCompletions = await Completion.countDocuments({ userId, guildId });
  const totalPages = Math.ceil(totalCompletions / pageSize);

  if (totalCompletions === 0) {
    const embed = new EmbedBuilder()
      .setTitle("📚 Completion History")
      .setColor("#ffa726")
      .setDescription("No completions found. Start solving problems with `/done`!");

    await interaction.editReply({ embeds: [embed] });
    return;
  }

  if (page > totalPages) {
    await interaction.editReply(`❌ Page ${page} doesn't exist. There are only ${totalPages} pages.`);
    return;
  }

  // Get completions for this page
  const completions = await Completion.find({ userId, guildId })
    .sort({ date: -1, completedAt: -1 })
    .skip(skip)
    .limit(pageSize);

  const isOwnProfile = interaction.user.id === userId;
  const displayName = isOwnProfile ? "Your" : `${targetUser.displayName}'s`;

  const embed = new EmbedBuilder()
    .setTitle(`📚 ${displayName} Completion History`)
    .setColor("#4ecdc4")
    .setFooter({ text: `Page ${page}/${totalPages} • ${totalCompletions} total completions` });

  // Format completions
  let description = "";
  for (const completion of completions) {
    const date = dayjs(completion.date).format('MMM DD, YYYY');
    const relativeDate = dayjs(completion.date).fromNow();
    
    // Create a clean line for each completion
    let line = `**${date}** (${relativeDate})\n`;
    line += `📝 \`${completion.questionSlug}\``;
    
    // Add time if available
    if (completion.timeTaken) {
      line += ` • ⏱️ ${completion.timeTaken}m`;
    }
    
    // Add solution link if available
    if (completion.solutionLink) {
      line += ` • [🔗 Solution](${completion.solutionLink})`;
    }
    
    // Add notes if available (truncated)
    if (completion.notes) {
      const truncatedNotes = completion.notes.length > 50 
        ? completion.notes.substring(0, 50) + "..." 
        : completion.notes;
      line += `\n💭 *${truncatedNotes}*`;
    }
    
    description += line + "\n\n";
  }

  embed.setDescription(description);

  // Create pagination buttons
  const buttons = [];
  
  if (page > 1) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`profile_history_${userId}_${page - 1}`)
        .setLabel("◀️ Previous")
        .setStyle(ButtonStyle.Primary)
    );
  }

  if (page < totalPages) {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`profile_history_${userId}_${page + 1}`)
        .setLabel("Next ▶️")
        .setStyle(ButtonStyle.Primary)
    );
  }

  // Add back to stats button
  buttons.push(
    new ButtonBuilder()
      .setCustomId(`profile_stats_${userId}`)
      .setLabel("📊 Back to Stats")
      .setStyle(ButtonStyle.Secondary)
  );

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(buttons);

  await interaction.editReply({ 
    embeds: [embed],
    components: [row]
  });
}
