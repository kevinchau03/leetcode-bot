import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { Question } from "../models/Question";

export const data = new SlashCommandBuilder()
  .setName("allquestions")
  .setDescription("Show all questions")
  .addIntegerOption(option =>
    option.setName("page")
      .setDescription("Page number to display")
      .setRequired(false)
      .setMinValue(1)
  );

const QUESTIONS_PER_PAGE = 10;

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  try {
    const page = interaction.options.getInteger("page") || 1;
    await showQuestionsPage(interaction, page);
  } catch (err) {
    console.error(err);
    await interaction.editReply("❌ Error fetching questions.");
  }
}

export async function showQuestionsPage(interaction: ChatInputCommandInteraction | any, page: number) {
  try {
    // Get total count for pagination
    const totalQuestions = await Question.countDocuments({});
    
    if (!totalQuestions) {
      return interaction.editReply("No questions found in the database.");
    }

    const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
    
    if (page > totalPages) {
      const errorMsg = `❌ Page ${page} doesn't exist. There are only ${totalPages} pages.`;
      if (interaction.editReply) {
        return interaction.editReply(errorMsg);
      } else {
        return interaction.update({ content: errorMsg, embeds: [], components: [] });
      }
    }

    // Get questions for this page
    const skip = (page - 1) * QUESTIONS_PER_PAGE;
    const questions = await Question.find({})
      .skip(skip)
      .limit(QUESTIONS_PER_PAGE)
      .lean();

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle("📚 All LeetCode Questions")
      .setColor("#00d4aa")
      .setFooter({ text: `Page ${page}/${totalPages} • ${totalQuestions} total questions` });

    // Format questions
    const questionList = questions
      .map((q, i) => {
        const globalIndex = skip + i + 1;
        const difficultyEmoji = getDifficultyEmoji(q.difficulty || "unknown");
        return `${globalIndex}. ${difficultyEmoji} **${q.title}** → [Link](${q.link})`;
      })
      .join("\n");

    embed.setDescription(questionList);

    // Create pagination buttons
    const buttons = [];
    
    if (page > 1) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`allquestions_page_${page - 1}`)
          .setLabel("◀️ Previous")
          .setStyle(ButtonStyle.Primary)
      );
    }

    if (page < totalPages) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(`allquestions_page_${page + 1}`)
          .setLabel("Next ▶️")
          .setStyle(ButtonStyle.Primary)
      );
    }

    // Add refresh button
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`allquestions_page_${page}`)
        .setLabel("🔄 Refresh")
        .setStyle(ButtonStyle.Secondary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(buttons);

    const messageData = { 
      embeds: [embed],
      components: buttons.length > 0 ? [row] : []
    };

    if (interaction.editReply) {
      await interaction.editReply(messageData);
    } else {
      await interaction.update(messageData);
    }
  } catch (err) {
    console.error("Error in showQuestionsPage:", err);
    const errorMsg = "❌ Error fetching questions.";
    if (interaction.editReply) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.update({ content: errorMsg, embeds: [], components: [] });
    }
  }
}

function getDifficultyEmoji(difficulty: string): string {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "🟢";
    case "medium":
      return "🟡";
    case "hard":
      return "🔴";
    default:
      return "⚪";
  }
}
