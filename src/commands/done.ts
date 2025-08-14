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
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
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
      flags: MessageFlags.Ephemeral
    });
  } else {
    await interaction.reply({
      content: `❌ Failed to update your streak. Please try again later.`,
      flags: MessageFlags.Ephemeral
    });
  }
}
