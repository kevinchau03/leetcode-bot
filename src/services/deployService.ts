import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } from "../config";
import { data as profile } from "../commands/profile";
import { data as daily } from "../commands/daily";
import { data as showAll } from "../commands/showAll";
import { data as done } from "../commands/done";
import { data as leaderboard } from "../commands/leaderboard";
import { data as completion } from "../commands/completions";

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  new SlashCommandBuilder().setName("whoami").setDescription("What is Eleet?"),
  new SlashCommandBuilder().setName("help").setDescription("Get help with the bot"),
  showAll,
  completion,
  daily,
  profile,
  done,
  leaderboard,
].map(c => c.toJSON());

export async function initializeDeployService(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  try {
    if (!DISCORD_GUILD_ID) {
      throw new Error("❌ DISCORD_GUILD_ID is required");
    }

    // Clear existing commands first
    console.log("🧹 Clearing existing commands...");
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: [] }
    );
    console.log("✅ Existing commands cleared");
    
    console.log("🔄 Registering commands to guild...");
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log("✅ Commands registered to guild");
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
    throw error;
  }
}

export async function deployCommands(): Promise<void> {
  await initializeDeployService();
}

export async function clearCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);
  
  try {
    if (!DISCORD_GUILD_ID) {
      throw new Error("❌ DISCORD_GUILD_ID is required");
    }
    
    await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID), { body: [] });
    console.log("✅ Guild commands cleared");
  } catch (error) {
    console.error("❌ Failed to clear commands:", error);
    throw error;
  }
}