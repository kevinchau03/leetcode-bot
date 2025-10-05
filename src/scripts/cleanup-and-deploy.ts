import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID } from "../config";
import { data as profile } from "../commands/profile";
import { data as daily } from "../commands/daily";
import { data as showAll } from "../commands/showAll";
import { data as done } from "../commands/done";
import { data as leaderboard } from "../commands/leaderboard";
import { data as completion } from "../commands/completions";

if (!DISCORD_TOKEN) {
  throw new Error("DISCORD_TOKEN is required");
}
if (!DISCORD_CLIENT_ID) {
  throw new Error("DISCORD_CLIENT_ID is required");
}

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

async function cleanupAndDeploy() {
  try {
    console.log("🧹 Starting command cleanup and deployment...");

    // Step 1: Clear all global commands
    console.log("🗑️ Clearing global commands...");
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: [] });
    console.log("✅ Global commands cleared");

    // Step 2: Clear guild commands (if guild ID is provided)
    if (DISCORD_GUILD_ID) {
      console.log("🗑️ Clearing guild commands...");
      await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID), { body: [] });
      console.log("✅ Guild commands cleared");
    }

    // Step 3: Wait a moment for Discord to process
    console.log("⏳ Waiting for Discord to process cleanup...");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Load all commands from commands directory
    console.log("📚 Loading commands...");

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

    console.log(`📋 Total commands loaded: ${commands.length}`);

    // Step 5: Deploy commands
    if (DISCORD_GUILD_ID) {
      // Deploy to guild (faster for development)
      console.log("🚀 Deploying commands to guild...");
      await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID), {
        body: commands,
      });
      console.log(`✅ Successfully deployed ${commands.length} commands to guild!`);
    } else {
      // Deploy globally (production)
      console.log("🌍 Deploying commands globally...");
      await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
        body: commands,
      });
      console.log(`✅ Successfully deployed ${commands.length} commands globally!`);
      console.log("⏳ Note: Global commands may take up to 1 hour to appear everywhere.");
    }

    // Step 6: List deployed commands
    console.log("\n📋 Deployed commands:");
    commands.forEach((cmd, index) => {
      console.log(`   ${index + 1}. /${cmd.name} - ${cmd.description}`);
    });

    console.log("\n🎉 Cleanup and deployment completed successfully!");

  } catch (error) {
    console.error("❌ Error during cleanup and deployment:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  cleanupAndDeploy()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("❌ Fatal error:", error);
      process.exit(1);
    });
}

export { cleanupAndDeploy };