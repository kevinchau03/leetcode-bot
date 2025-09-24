// commands/done.ts
import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { getOrCreateProfile } from "../lib/profiles";
import { Completion } from "../models/Completion";
import { Profile } from "../models/Profile";
import { DailyQuestion } from "../models/Daily";
import { EmbedBuilder } from "discord.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { calculatePoints, calculateLevelFromExp } from "../lib/points";
import { getQuestionInfoFromUrl } from "../lib/leetcode";

// Enable timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const data = new SlashCommandBuilder()
  .setName("done")
  .setDescription("Mark a LeetCode question as completed")
  .addStringOption(option =>
    option.setName("solution")
      .setDescription("Link to your LeetCode solution")
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName("time")
      .setDescription("Time taken in minutes")
      .setRequired(false)
      .setMinValue(1)
      .setMaxValue(600)
  )
  .addStringOption(option =>
    option.setName("notes")
      .setDescription("Any notes about your approach or learnings")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("timezone")
      .setDescription("Your timezone (e.g., America/New_York, Europe/London)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId!;
    
    // Get user's profile to check their timezone
    const profile = await getOrCreateProfile(userId, guildId);
    const userTimezone = interaction.options.getString("timezone") || profile.tz || "America/Toronto";
    
    // Calculate "today" based on user's timezone
    const today = dayjs().tz(userTimezone).format("YYYY-MM-DD");
    const yesterday = dayjs().tz(userTimezone).subtract(1, 'day').format("YYYY-MM-DD");

    console.log(`🕐 User timezone: ${userTimezone}, Today: ${today}, Yesterday: ${yesterday}`);

    // Update user's timezone if provided
    if (interaction.options.getString("timezone") && interaction.options.getString("timezone") !== profile.tz) {
      await Profile.findOneAndUpdate(
        { userId, guildId },
        { $set: { tz: userTimezone } }
      );
      console.log(`🌍 Updated timezone for user ${userId} to ${userTimezone}`);
    }

    // Get solution link and fetch question info
    const solutionLink = interaction.options.getString("solution", true);
    
    // Fetch question info from the solution URL
    const questionInfo = await getQuestionInfoFromUrl(solutionLink);
    if (!questionInfo) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("❌ Invalid Solution Link")
          .setDescription("Please provide a valid LeetCode solution URL (e.g., `https://leetcode.com/problems/two-sum/solutions/...`)")
        ]
      });
    }

    // Check if already completed this question today
    const existingCompletion = await Completion.findOne({
      userId,
      guildId,
      questionSlug: questionInfo.slug,
      date: today
    });

    if (existingCompletion) {
      return interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor("#ff0000")
          .setTitle("❌ Already Completed")
          .setDescription(`You've already logged **${questionInfo.title}** today!`)
        ]
      });
    }

    // Check if this matches today's daily challenge
    const dailyQuestion = await DailyQuestion.findOne({ date: today }).lean();
    const isDaily = dailyQuestion && dailyQuestion.slug === questionInfo.slug;
    const isCurated = !!dailyQuestion && isDaily;

    // Get optional parameters
    const timeTaken = interaction.options.getInteger("time");
    const notes = interaction.options.getString("notes");

    // Calculate points (with daily bonus if it matches today's challenge)
    const points = calculatePoints(questionInfo.difficulty, !!isDaily);

    // Create completion record
    await Completion.create({
      userId,
      guildId,
      date: today,
      questionSlug: questionInfo.slug,
      questionTitle: questionInfo.title,
      questionId: questionInfo.questionId,
      difficulty: questionInfo.difficulty,
      isCurated,
      isDaily,
      solutionLink,
      timeTaken,
      notes,
      pointsEarned: points,
      completedAt: new Date()
    });

    // Update profile - only update streak if it's the daily challenge
    let nextCurrent = profile.currentStreak ?? 0;
    let streakUpdated = false;

    if (isDaily) {
      if (profile.lastCompletedDate === today) {
        // Already counted today
        nextCurrent = profile.currentStreak ?? 0;
      } else if (profile.lastCompletedDate === yesterday) {
        // Continuing streak
        nextCurrent = (profile.currentStreak ?? 0) + 1;
        streakUpdated = true;
      } else {
        // New streak or broken streak
        nextCurrent = 1;
        streakUpdated = true;
      }
    }

    // Update profile with points and level
    const currentExp = profile.exp || 0;
    const newExp = currentExp + points;
    const newLevel = calculateLevelFromExp(newExp);
    const leveledUp = newLevel > (profile.level || 1);

    const updateData: any = {
      exp: newExp,
      level: newLevel
    };

    // Only update streak-related fields if this was the daily challenge
    if (isDaily) {
      updateData.lastCompletedDate = today;
      updateData.currentStreak = nextCurrent;
      updateData.tz = userTimezone;
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId, guildId },
      {
        $set: updateData,
        ...(isDaily && { $max: { bestStreak: nextCurrent } })
      },
      { new: true }
    );

    if (!updatedProfile) {
      await interaction.editReply("❌ Could not update your profile. Please try again later.");
      return;
    }

    // Get completion stats for this question today
    const todayCompletions = await Completion.find({
      guildId,
      questionSlug: questionInfo.slug,
      date: today
    }).sort({ completedAt: 1 });

    const totalCompletions = todayCompletions.length;
    const userPosition = todayCompletions.findIndex(c => c.userId === userId) + 1;
    const isFirst = userPosition === 1 && isDaily; // Only show "first" for daily challenges

    // Create response embed
    const embed = new EmbedBuilder()
      .setColor(
        isFirst ? "#FFD700" : 
        leveledUp ? "#FF6B35" : 
        isDaily ? "#00ff00" : "#0099ff"
      )
      .setTitle(
        leveledUp ? "🎉 Level Up!" :
        isFirst ? "🥇 First to Complete Daily!" : 
        isDaily ? "✅ Daily Challenge Complete!" :
        "✅ Question Completed!"
      )
      .setDescription(`**${questionInfo.title}** (${questionInfo.difficulty}) marked as complete!`)
      .addFields([
        { name: "⭐ Level", value: `${updatedProfile.level}`, inline: true },
        { name: "💎 Points Earned", value: `+${points} exp${isDaily ? ' (Daily Bonus!)' : ''}`, inline: true },
        { name: "📊 Difficulty", value: questionInfo.difficulty, inline: true }
      ]);

    // Add streak info only for daily challenges
    if (isDaily) {
      embed.addFields([
        { name: "🔥 Current Streak", value: `${updatedProfile.currentStreak} days`, inline: true },
        { name: "🏆 Best Streak", value: `${updatedProfile.bestStreak} days`, inline: true },
        { name: "📊 Position", value: `${userPosition}/${totalCompletions} today`, inline: true }
      ]);
    }

    // Add level up celebration
    if (leveledUp) {
      embed.addFields([
        { name: "🎊 Congratulations!", value: `You reached level ${newLevel}!`, inline: false }
      ]);
    }

    // Add optional fields
    if (timeTaken) {
      embed.addFields([{ name: "⏱️ Time Taken", value: `${timeTaken} minutes`, inline: true }]);
    }
    
    if (notes) {
      embed.addFields([{ name: "📝 Notes", value: notes, inline: false }]);
    }

    // Show celebration for daily challenge completion
    if (isDaily) {
      embed.addFields([
        { name: "🎯 Challenge Type", value: "Daily Challenge", inline: true },
        { name: "🕐 Date", value: `${today} (${userTimezone})`, inline: true }
      ]);

      // Show who else completed the daily challenge
      if (totalCompletions > 1) {
        const otherCompletions = todayCompletions.filter(c => c.userId !== userId);
        const otherUsers = otherCompletions.slice(0, 5).map((c, i) => {
          const position = todayCompletions.findIndex(comp => comp.userId === c.userId) + 1;
          const medal = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : "✅";
          return `${medal} <@${c.userId}>`;
        }).join("\n");

        const moreCount = Math.max(0, otherCompletions.length - 5);
        embed.addFields([{
          name: "👥 Others who completed the daily",
          value: otherUsers + (moreCount > 0 ? `\n+${moreCount} more` : ""),
          inline: false
        }]);
      }
    } else {
      embed.addFields([
        { name: "🎯 Challenge Type", value: "Practice Problem", inline: true }
      ]);
    }

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error("Error in done command:", error);
    
    const errorMsg = "❌ An error occurred while marking the question as completed. Please check your solution URL and try again.";
    
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMsg);
      } else {
        await interaction.reply({ content: errorMsg });
      }
    } catch (replyError) {
      console.error("Error sending error message:", replyError);
    }
  }
}
