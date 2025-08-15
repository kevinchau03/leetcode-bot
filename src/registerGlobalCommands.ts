import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { data as profile } from "./commands/profile";
import { data as daily } from "./commands/daily";
import { data as showAll } from "./commands/showAll";
import { data as done } from "./commands/done";

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  new SlashCommandBuilder().setName("whoami").setDescription("What is Eleet?"),
  showAll,
  daily,
  profile,
  done,
  new SlashCommandBuilder().setName("leaderboard").setDescription("View the leaderboard"),
  new SlashCommandBuilder().setName("help").setDescription("Get help with the bot")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Registering commands globally...");
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );
    console.log("✅ Commands registered globally");
    console.log("Note: Global commands may take up to 1 hour to appear in all servers");
  } catch (err) {
    console.error(err);
  }
})();
