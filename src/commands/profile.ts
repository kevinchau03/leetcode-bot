import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User
} from "discord.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { Profile } from "../models/Profile";
import { Completion } from "../models/Completion";

dayjs.extend(utc); dayjs.extend(tz);
const TZ = process.env.TZ || "America/Toronto";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("View your LeetCode streak profile (or someone else's).")
  .addUserOption(opt =>
    opt.setName("user")
      .setDescription("User to view (optional)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply(); // non-ephemeral so people can flex their streaks 😎

  const targetUser: User = interaction.options.getUser("user") ?? interaction.user;
  const userId = targetUser.id;
  const guildId = interaction.guildId!;
  const today = dayjs().tz(TZ).format("YYYY-MM-DD");

  // Load/create profile minimally
  let profile = await Profile.findOne({ userId, guildId }).lean();

  // Completions count (all time)
  const totalCompletions = await Completion.countDocuments({ userId, guildId });

  if (!profile) {
    // No data yet—show a friendly empty state
    const empty = new EmbedBuilder()
      .setAuthor({ name: `${targetUser.username}` , iconURL: targetUser.displayAvatarURL() })
      .setTitle("LeetCode Profile")
      .setDescription("No streak yet—use `/done` after solving today’s problem to start your streak!")
      .addFields(
        { name: "Current Streak", value: "0", inline: true },
        { name: "Best Streak", value: "0", inline: true },
        { name: "Last Completed", value: "—", inline: true },
      )
      .addFields({ name: "Total Completions", value: `${totalCompletions}`, inline: true })
      .setFooter({ text: `Today: ${today} (${TZ})` });

    return interaction.editReply({ embeds: [empty] });
  }

  const embed = new EmbedBuilder()
    .setAuthor({ name: `${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
    .setTitle("LeetCode Profile")
    .addFields(
      { name: "Current Streak", value: `${profile.currentStreak}`, inline: true },
      { name: "Best Streak", value: `${profile.bestStreak}`, inline: true },
      { name: "Last Completed", value: profile.lastCompletedDate ?? "—", inline: true },
    )
    .addFields({ name: "Total Completions", value: `${totalCompletions}`, inline: true })
    .setFooter({ text: `Today: ${today} (${TZ})` });

  await interaction.editReply({ embeds: [embed] });
}
