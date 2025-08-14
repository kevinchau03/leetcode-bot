// commands/profile.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import { getOrCreateProfile } from "../lib/profiles";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Show your LeetCode streak profile");

export async function execute(interaction: ChatInputCommandInteraction) {
  console.log(`Profile command start - replied: ${interaction.replied}, deferred: ${interaction.deferred}`);
  
  try {
    // Check if interaction is already acknowledged
    if (!interaction.replied && !interaction.deferred) {
      console.log("Deferring reply...");
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      console.log("Reply deferred successfully");
    } else {
      console.log("Interaction already acknowledged, skipping defer");
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

    if (interaction.deferred) {
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  } catch (error) {
    console.error("Error in profile command:", error);
    
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
