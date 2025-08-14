// commands/profile.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { getOrCreateProfile } from "../lib/profiles";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Show your LeetCode streak profile");

export async function execute(interaction: ChatInputCommandInteraction) {
  const userId = interaction.user.id;
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: "This command can only be used in a server.", flags: MessageFlags.Ephemeral });
    return;
  }
  const profile = await getOrCreateProfile(userId, guildId);

  const embed = new EmbedBuilder()
    .setTitle(`${interaction.user.username} — LeetCode Profile`)
    .addFields(
      { name: "Current Streak", value: `${profile.currentStreak} 🔥`, inline: true },
      { name: "Best Streak", value: `${profile.bestStreak}`, inline: true },
      { name: "Last Completed", value: profile.lastCompletedDate ?? "—", inline: true },
    )
    .setFooter({ text: `TZ: ${profile.tz ?? "UTC"}` })
    .setTimestamp(new Date());

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
