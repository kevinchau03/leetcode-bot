import "dotenv/config";
import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import type { Interaction } from "discord.js";
import mongoose from "mongoose";
import { DISCORD_TOKEN, MONGODB_URI, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } from './config';
import { execute as showAll } from './commands/showAll';
import { execute as daily } from './commands/daily';
import { execute as profile } from './commands/profile';
import { execute as done } from './commands/done';

// Auto-register commands on startup
async function registerCommands() {
  try {
    console.log("🔄 Importing Discord.js modules...");
    const { REST, Routes, SlashCommandBuilder } = await import("discord.js");
    
    console.log("🔄 Importing command data...");
    const { data: profileData } = await import('./commands/profile');
    const { data: dailyData } = await import('./commands/daily');
    const { data: showAllData } = await import('./commands/showAll');
    const { data: doneData } = await import('./commands/done');

    const clientId = DISCORD_CLIENT_ID;
    const guildId = DISCORD_GUILD_ID;
    
    console.log(`🔄 Client ID: ${clientId ? 'Present' : 'Missing'}`);
    console.log(`🔄 Guild ID: ${guildId ? 'Present' : 'Missing'}`);
    
    if (!clientId) {
      throw new Error("DISCORD_CLIENT_ID environment variable is missing");
    }
    
    console.log("🔄 Building command array...");
    const commands = [
      new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
      new SlashCommandBuilder().setName("whoami").setDescription("What is Eleet?"),
      showAllData,
      dailyData,
      profileData,
      doneData
    ].map(c => c.toJSON());

    console.log(`🔄 Created ${commands.length} commands`);
    
    const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

    if (guildId) {
      console.log("🔄 Registering commands to guild...");
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log("✅ Commands registered to guild");
    } else {
      console.log("🔄 Registering commands globally...");
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log("✅ Commands registered globally");
    }
  } catch (error) {
    console.error("❌ Failed to register commands:", error);
    throw error; // Re-throw to be caught by the caller
  }
}



const client = new Client({
  intents: [GatewayIntentBits.Guilds], // enough for slash commands
});

client.once("ready", async () => {
  console.log("Alright Here we go we starting.");
  console.log(`✅ Logged in as ${client.user?.tag}`);
  console.log("🔄 Setting up commands...");
  // Register commands on startup with better error handling
  try {
    console.log("🔄 Starting command registration...");
    await registerCommands();
    console.log("✅ Command registration completed");
  } catch (error) {
    console.error("❌ Command registration failed:", error);
    console.log("⚠️ Bot will continue without command registration");
  }
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
  
  console.log(`Received command: ${commandName} from ${interaction.user.username} (${interaction.user.id})`);
  console.log(`Interaction state - replied: ${interaction.replied}, deferred: ${interaction.deferred}`);

  try {
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
      case "profile":
        await profile(interaction);
        break;
      case "done":
        await done(interaction);
        break;
      default:
        await interaction.reply({ content: "Unknown command", flags: MessageFlags.Ephemeral });
        break;
    }
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    // Error handling is now done within each command
  }
});

client.login(DISCORD_TOKEN);

// Add process error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
