import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import type { Interaction } from "discord.js";
import mongoose from "mongoose";
import { DISCORD_TOKEN, MONGODB_URI } from './config';
import { execute as showAll } from './commands/showAll';
import { execute as daily } from './commands/daily';



const client = new Client({
  intents: [GatewayIntentBits.Guilds], // enough for slash commands
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

// Connect to MongoDB
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI environment variable is not defined.");
}
mongoose.connect(MONGODB_URI).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  switch (commandName) {
    case "ping":
      await interaction.reply("Pong! 🏓");
      break;
    case "whoami":
      await interaction.reply("I am Eleet, your coding companion! I provide users with daily leetcode challenges so that they can become elite! 🤖");
      break;
    case "allquestions":
      await showAll(interaction);
      break;
    case "daily":
      await daily(interaction);
      break;
    default:
      await interaction.reply({ content: "Unknown command", ephemeral: true });
      break;
  }
});

client.login(DISCORD_TOKEN);
