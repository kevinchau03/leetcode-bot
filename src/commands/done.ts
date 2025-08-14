// commands/done.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { Profile } from "../models/Profile";
import { getOrCreateProfile } from "../lib/profiles";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(tz);

export const data = new SlashCommandBuilder()
  .setName("done")
  .setDescription("Mark today's LeetCode as completed")
  .addStringOption(o =>
    o.setName("tz")
     .setDescription("Your timezone (IANA, e.g. America/Toronto)")
     .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    // Check if interaction is already acknowledged
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    }
    
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    if (!guildId) {
      const errorMsg = "This command can only be used in a server.";
      if (interaction.deferred) {
        await interaction.editReply({ content: errorMsg });
      } else {
        await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral });
      }
      return;
    }
    let profile = await getOrCreateProfile(userId, guildId);
  const tz = interaction.options.getString("tz") ?? profile.tz ?? "UTC";
  const today = dayjs().tz(tz).format("YYYY-MM-DD");
  const yesterday = dayjs().tz(tz).subtract(1, "day").format("YYYY-MM-DD");

  // Compute new streak values in app code, then persist atomically.
  let nextCurrent = profile.currentStreak ?? 0;

  if (profile.lastCompletedDate === today) {
    // already counted today
  } else if (profile.lastCompletedDate === yesterday) {
    nextCurrent = (profile.currentStreak ?? 0) + 1;
  } else {
    nextCurrent = 1;
  }

  const update = await Profile.findOneAndUpdate(
    { userId, guildId },
    {
      $set: {
        tz,
        lastCompletedDate: today,
        currentStreak: nextCurrent,
      },
      $max: { bestStreak: nextCurrent }
    },
    { new: true }
  );

  if (update) {
    const successMsg = `✅ Logged for **${today}** (${tz}). Streak: **${update.currentStreak}** (best: ${update.bestStreak}).`;
    if (interaction.deferred) {
      await interaction.editReply({ content: successMsg });
    } else {
      await interaction.reply({ content: successMsg, flags: MessageFlags.Ephemeral });
    }
  } else {
    const errorMsg = `❌ Failed to update your streak. Please try again later.`;
    if (interaction.deferred) {
      await interaction.editReply({ content: errorMsg });
    } else {
      await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral });
    }
  }
  } catch (error) {
    console.error("Error in done command:", error);
    
    // Only try to respond if it's not an expired interaction error
    if (error && typeof error === 'object' && 'code' in error && error.code !== 10062) {
      try {
        const errorMsg = "An error occurred while processing your command.";
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMsg });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMsg, flags: MessageFlags.Ephemeral });
        }
      } catch (followUpError) {
        console.error("Failed to send error response:", followUpError);
      }
    } else {
      console.log("Interaction expired or unknown error, cannot respond");
    }
  }
}
