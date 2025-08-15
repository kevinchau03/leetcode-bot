// commands/done.ts
import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { getOrCreateProfile } from "../lib/profiles";
import { Completion } from "../models/Completion";
import { Profile } from "../models/Profile";
import { DailyQuestion } from "../models/Daily";
import { EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("done")
  .setDescription("Mark today's LeetCode as completed")
  .addStringOption(option =>
    option.setName("solution")
      .setDescription("Link to your solution (GitHub, LeetCode, etc.)")
      .setRequired(false)
  )
  .addIntegerOption(option =>
    option.setName("time")
      .setDescription("Time taken in minutes")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(600)
  )
  .addIntegerOption(option =>
    option.setName("difficulty")
      .setDescription("How difficult did you find it? (1=Very Easy, 5=Very Hard)")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(5)
  )
  .addStringOption(option =>
    option.setName("notes")
      .setDescription("Any notes about your approach or learnings")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId!;
    const today = new Date().toISOString().split("T")[0];

    // Get today's question
    const q = await DailyQuestion.findOne({ date: today }).lean();
    
      if (!q) {
        return interaction.editReply(
          `No daily question found for **${today}** yet. (Seed one or run your daily job.)`
        );
      }

    // Check if already completed
    const existingCompletion = await Completion.findOne({
      userId,
      guildId,
      date: today
    });

    if (existingCompletion) {
      await interaction.editReply("✅ You've already marked today's question as completed!");
      return;
    }

    // Get optional parameters
    const solutionLink = interaction.options.getString("solution");
    const timeTaken = interaction.options.getInteger("time");
    const difficultyRating = interaction.options.getInteger("difficulty");
    const notes = interaction.options.getString("notes");

    // Create completion record
    await Completion.create({
      userId,
      guildId,
      date: today,
      questionSlug: q.slug,
      solutionLink,
      timeTaken,
      difficultyRating,
      notes,
      completedAt: new Date()
    });

    // Update profile streak
    const profile = await getOrCreateProfile(userId, guildId);
    let nextCurrent = profile.currentStreak ?? 0;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]; // 24 hours ago

    if (profile.lastCompletedDate === today) {
      // already counted today
    } else if (profile.lastCompletedDate === yesterday) {
      nextCurrent = (profile.currentStreak ?? 0) + 1;
    } else {
      nextCurrent = 1;
    }

    await Profile.findOneAndUpdate(
      { userId, guildId },
      {
        $set: {
          lastCompletedDate: today,
          currentStreak: nextCurrent,
        },
        $max: { bestStreak: nextCurrent }
      },
      { new: true }
    );

    // Get completion stats for today
    const todayCompletions = await Completion.find({
      guildId,
      date: today
    }).sort({ completedAt: 1 });

    const totalCompletions = todayCompletions.length;
    const userPosition = todayCompletions.findIndex(c => c.userId === userId) + 1;
    const isFirst = userPosition === 1;

    // Create response embed
    const embed = new EmbedBuilder()
      .setColor(isFirst ? "#FFD700" : "#00ff00")
      .setTitle(isFirst ? "🥇 First to Complete!" : "✅ Question Completed!")
      .setDescription(`**${q.title}** marked as complete!`)
      .addFields([
        { name: "🔥 Current Streak", value: `${profile.currentStreak} days`, inline: true },
        { name: "🏆 Best Streak", value: `${profile.bestStreak} days`, inline: true },
        { name: "📊 Today's Stats", value: `${userPosition}/${totalCompletions} completed`, inline: true }
      ]);

    if (solutionLink) embed.addFields([{ name: "🔗 Solution", value: solutionLink, inline: false }]);
    if (timeTaken) embed.addFields([{ name: "⏱️ Time Taken", value: `${timeTaken} minutes`, inline: true }]);
    if (difficultyRating) embed.addFields([{ name: "⭐ Difficulty Rating", value: `${difficultyRating}/5`, inline: true }]);
    if (notes) embed.addFields([{ name: "📝 Notes", value: notes, inline: false }]);

    // Show who else completed it
    if (totalCompletions > 1) {
      const otherCompletions = todayCompletions.filter(c => c.userId !== userId);
      const otherUsers = otherCompletions.slice(0, 5).map((c, i) => {
        const position = todayCompletions.findIndex(comp => comp.userId === c.userId) + 1;
        const medal = position === 1 ? "🥇" : position === 2 ? "🥉" : position === 3 ? "🥉" : "✅";
        return `${medal} <@${c.userId}>`;
      }).join("\n");

      const moreCount = Math.max(0, otherCompletions.length - 5);
      embed.addFields([{
        name: "👥 Others who completed today",
        value: otherUsers + (moreCount > 0 ? `\n+${moreCount} more` : ""),
        inline: false
      }]);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error("Error in done command:", error);
    // ... error handling ...
  }
}
