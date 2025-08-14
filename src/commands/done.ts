// commands/done.ts
import { SlashCommandBuilder } from "discord.js";
import { Profile } from "../models/Profile";
import { getOrCreateProfile } from "../lib/profiles";

export const data = new SlashCommandBuilder()
  .setName("done")
  .setDescription("Mark today's LeetCode as completed")
  .addStringOption(o =>
    o.setName("tz")
     .setDescription("Your timezone (IANA, e.g. America/Toronto)")
     .setRequired(false)
  );

export async function execute(interaction: any) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;

  let profile = await getOrCreateProfile(userId, guildId);
  const tz = interaction.options.getString("tz") ?? profile.tz ?? "UTC";
  const today = new Date().toLocaleDateString("en-US", { timeZone: tz });
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-US", { timeZone: tz });

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
        lastCompletedDay: today,
        currentStreak: nextCurrent,
      },
      $max: { bestStreak: nextCurrent }
    },
    { new: true }
  );

  if (update) {
    await interaction.reply({
      content: `✅ Logged for **${today}** (${tz}). Streak: **${update.currentStreak}** (best: ${update.bestStreak}).`,
      ephemeral: true
    });
  } else {
    await interaction.reply({
      content: `❌ Failed to update your streak. Please try again later.`,
      ephemeral: true
    });
  }
}
