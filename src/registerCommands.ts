import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { data as profile } from "./commands/profile";
import { data as daily } from "./commands/daily";
import { data as showAll } from "./commands/showAll";

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;
const devGuildId = process.env.DISCORD_GUILD_ID!;

const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  new SlashCommandBuilder().setName("whoami").setDescription("What is Eleet?"),
  showAll,
  daily,
  profile
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
