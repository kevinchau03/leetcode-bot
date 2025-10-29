import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { Completion } from "../models/Completion";

export const data = new SlashCommandBuilder()
  .setName("completions")
  .setDescription("View your recent LeetCode completions");

export async function execute(interaction: ChatInputCommandInteraction) {
  try {

    await interaction.deferReply();

    const userId = interaction.user.id;
    const guildId = interaction.guildId!;
    
    // Pull most recent first; cap to a sensible number to avoid hitting Discord limits
    // (25 is usually safe for a simple one-line-per-item list).
    const completions = await Completion.find({ userId, guildId })
      .sort({ completedAt: -1 })
      .limit(25)
      .lean();

    if (completions.length === 0) {
      await interaction.editReply(
        "You have no recorded completions yet. Use `/done` to log your first completion!"
      );
      return;
    }

    const lines: string[] = [];
    for (const c of completions) {
      const title = c.questionTitle ?? "Untitled Problem";
      const link =
        c.solutionLink ||
        (c.questionSlug ? `https://leetcode.com/problems/${c.questionSlug}/` : null);

      // If we can’t build a link, just show the title without markdown link.
      const line = link ? `• [${escapeMd(title)}](${link})` : `• ${escapeMd(title)}`;
      lines.push(line);
    }

    // Keep the embed description within Discord’s 4096-char limit; trim if needed.
    let description = lines.join("\n");
    if (description.length > 4000) {
      // Trim lines until it fits; add a note.
      while (description.length > 4000 && lines.length > 0) {
        lines.pop();
        description = lines.join("\n");
      }
      description += `\n… and more`;
    }

    const embed = new EmbedBuilder()
      .setTitle("📚 Your LeetCode Completions")
      .setDescription(description)
      .setColor(0x00ff00);

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error("Error in /completions:", err);
    // If editReply fails because the interaction wasn’t deferred yet, fall back to reply
    try {
      await interaction.editReply("❌ An error occurred while fetching your completions.");
    } catch {
      await interaction.reply({
        content: "❌ An error occurred while fetching your completions.",
        ephemeral: true,
      });
    }
  }
}

/** Minimal MD escaping for titles placed inside link text. */
function escapeMd(s: string): string {
  return s.replace(/([\[\]\(\)_~`>\\*|])/g, "\\$1");
}
