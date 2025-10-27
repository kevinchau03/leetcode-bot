import type { ChatInputCommandInteraction } from "discord.js";
import { MessageFlags } from "discord.js";
import { execute as showAll } from "../commands/showAll";
import { execute as daily } from "../commands/daily";
import { execute as profile } from "../commands/profile";
import { execute as done } from "../commands/done";
import { execute as leaderboard } from "../commands/leaderboard";
import { execute as completions } from "../commands/completions";

export async function handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  const { commandName } = interaction;
  console.log(`Received command: ${commandName} from ${interaction.user.username} (${interaction.user.id})`);

  try {
    switch (commandName) {
      case "ping":
        await interaction.reply("Pong! 🏓");
        break;
      case "help":
        await interaction.reply("COMING SOON!!");
        break;
      case "whoami":
        await interaction.reply(
          "I am Eleet, your coding companion! I provide users with daily leetcode challenges so that they can become elite! 🤖"
        );
        break;
      case "allquestions":
        await showAll(interaction);
        break;
      case "completions":
        await completions(interaction);
        break;
      case "daily":
        await daily(interaction);
        break;
      case "profile":
        await profile(interaction);
        break;
      case "done":
        await done(interaction);
        break;
      case "leaderboard":
        await leaderboard(interaction);
        break;
      default:
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ 
            content: "Unknown command", 
            flags: MessageFlags.Ephemeral 
          });
        }
    }
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: "An error occurred while processing your command.", 
        flags: MessageFlags.Ephemeral 
      });
    } else if (interaction.deferred && !interaction.replied) {
      await interaction.editReply({ 
        content: "An error occurred while processing your command." 
      });
    }
  }
}