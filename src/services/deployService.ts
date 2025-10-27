import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { data as profile } from "../commands/profile";
import { data as daily } from "../commands/daily";
import { data as showAll } from "../commands/showAll";
import { data as done } from "../commands/done";
import { data as leaderboard } from "../commands/leaderboard";
import { data as completion } from "../commands/completions";

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const devGuildId = process.env.DISCORD_GUILD_ID;

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
  const rest = new REST({ version: "10" }).setToken(token);

  try {
    if (isProduction) {
      console.log("🔄 Clearing existing global commands...");
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
      console.log("✅ Existing commands cleared");
      
      console.log("🔄 Registering commands globally...");
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log("✅ Commands registered globally (may take up to 1 hour to propagate)");
    } else {
      if (!devGuildId) {
        throw new Error("❌ DISCORD_GUILD_ID is required for development");
      }
      
      console.log("🔄 Registering commands to development guild...");
      await rest.put(
        Routes.applicationGuildCommands(clientId, devGuildId),
        { body: commands }
      );
      console.log("✅ Commands registered to development guild");
    }
  } catch (error) {
    console.error("❌ Failed to deploy commands:", error);
    throw error;
  }
}

export async function deployCommands(): Promise<void> {
  // Alias for backwards compatibility or manual deployment
  await initializeDeployService();
}

export async function clearCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(token);
  
  try {
    if (isProduction) {
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
      console.log("✅ Global commands cleared");
    } else {
      if (!devGuildId) {
        throw new Error("❌ DISCORD_GUILD_ID is required for development");
      }
      await rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: [] });
      console.log("✅ Development guild commands cleared");
    }
  } catch (error) {
    console.error("❌ Failed to clear commands:", error);
    throw error;
  }
}