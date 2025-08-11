import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const devGuildId = process.env.DISCORD_GUILD_ID!;

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  new SlashCommandBuilder().setName("whoami").setDescription("What is Eleet?"),
  new SlashCommandBuilder().setName("allquestions").setDescription("Get all questions."),
  new SlashCommandBuilder().setName("daily").setDescription("Show today's daily LeetCode question.")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Registering commands...");
    await rest.put(
      Routes.applicationGuildCommands(clientId, devGuildId),
      { body: commands }
    );
    console.log("✅ Commands registered to dev guild");
  } catch (err) {
    console.error(err);
  }
})();
