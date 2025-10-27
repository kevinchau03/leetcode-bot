import type { ButtonInteraction } from "discord.js";
import { showQuestionsPage } from "../commands/showAll";
import { handleCompletionsButton } from "../commands/completions";

export async function handleButton(interaction: ButtonInteraction): Promise<void> {
  const customId = interaction.customId;
  console.log(`Received button interaction: ${customId} from ${interaction.user.username}`);

  try {
    if (customId.startsWith("allquestions_page_")) {
      const page = parseInt(customId.split("_")[2]);
      await showQuestionsPage(interaction, page);
    } else if (customId.startsWith("completions_")) {
      await handleCompletionsButton(interaction);
    } else {
      await interaction.reply({ 
        content: "Unknown button interaction", 
        ephemeral: true 
      });
    }
  } catch (error) {
    console.error(`Error handling button interaction ${customId}:`, error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: "An error occurred while processing your request.", 
        ephemeral: true 
      });
    }
  }
}