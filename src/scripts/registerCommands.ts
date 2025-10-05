import "dotenv/config";
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
const isProduction = process.env.NODE_ENV === "production";

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  new SlashCommandBuilder().setName("whoami").setDescription("What is Eleet?"),
  showAll,
  completion,
  daily,
  profile,
  done,
  leaderboard,
  new SlashCommandBuilder().setName("help").setDescription("Get help with the bot")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    if (isProduction) {
      console.log("Clearing all existing global commands...");
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: [] }
      );
      console.log("✅ All existing commands cleared");
      
      console.log("Registering commands globally for production...");
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log("✅ Commands registered globally");
    } else {
      if (!devGuildId) {
        throw new Error("DISCORD_GUILD_ID is required for development");
      }
      console.log("Registering commands to dev guild...");
      await rest.put(
        Routes.applicationGuildCommands(clientId, devGuildId),
        { body: commands }
      );
      console.log("✅ Commands registered to dev guild");
    }
  } catch (err) {
    console.error(err);
  }
})();
