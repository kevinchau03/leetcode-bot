// index.ts
import "dotenv/config";
import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import type { Interaction } from "discord.js";
import mongoose from "mongoose";
import { DISCORD_TOKEN, MONGODB_URI } from "./config";
import { execute as showAll } from "./commands/showAll";
import { execute as daily } from "./commands/daily";
import { execute as profile } from "./commands/profile";
import { execute as done } from "./commands/done";
import { execute as leaderboard } from "./commands/leaderboard";
import { startCron } from "./cron/worker";
import { cleanupAndDeploy } from "./scripts/cleanup-and-deploy";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
  console.log("✅ Bot is online.");
  console.log(`✅ Logged in as ${client.user?.tag}`);
  
  try {
    await cleanupAndDeploy();
  } catch (err) {
    console.error("❌ Failed to cleanup and deploy commands:", err);
  }

  // Start cron worker (uses same process; no second command needed)
  try {
    await startCron();
  } catch (err) {
    console.error("❌ Failed to start cron worker:", err);
  }
});

// DB (connect once here so commands can use it too)
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI environment variable is not defined.");
}
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

client.on("interactionCreate", async (interaction: Interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

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
            try {
              await interaction.reply({ content: "Unknown command", flags: MessageFlags.Ephemeral });
            } catch (replyError) {
              console.error("Failed to reply to unknown command:", replyError);
            }
          }
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "An error occurred while processing your command.", flags: MessageFlags.Ephemeral });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: "An error occurred while processing your command." });
        }
      } catch (responseError) {
        console.error("Could not send error response:", responseError);
      }
    }
  } catch (outerError) {
    console.error("Unhandled error in interactionCreate event:", outerError);
  }
});

client.login(DISCORD_TOKEN);

// Safety handlers
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});
client.on("error", (error) => {
  console.error("❌ Discord client error:", error);
});
