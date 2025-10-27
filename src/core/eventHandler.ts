import type { Client, Interaction } from "discord.js";
import { handleCommand } from "../handlers/commandHandler";
import { handleButton } from "../handlers/buttonHandler";

export function registerEventHandlers(client: Client): void {
  client.on("interactionCreate", async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
      } else if (interaction.isButton()) {
        await handleButton(interaction);
      }
    } catch (outerError) {
      console.error("Unhandled error in interactionCreate event:", outerError);
    }
  });

  // Error handlers
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  });

  client.on("error", (error) => {
    console.error("❌ Discord client error:", error);
  });
}