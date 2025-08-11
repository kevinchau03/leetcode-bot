import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import type { Interaction } from "discord.js";
import mongoose from "mongoose";
import { DISCORD_TOKEN, MONGODB_URI } from './config';



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
  if (interaction.commandName === "ping") {
    await interaction.reply("Pong! 🏓");
  }
  else if (interaction.commandName === "whoami") {
    await interaction.reply("I am Eleet, your coding companion! I provide users with daily leetcode challenges so that they can become elite! 🤖");
  } else {
    await interaction.reply({ content: "Unknown command", ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
