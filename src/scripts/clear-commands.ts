import "dotenv/config";
import { REST, Routes } from "discord.js";

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.DISCORD_CLIENT_ID!;

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🧹 Clearing all global commands...");
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: [] }
    );
    console.log("✅ All global commands cleared successfully");
  } catch (err) {
    console.error("❌ Error clearing commands:", err);
  }
})();
