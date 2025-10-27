import "dotenv/config";
import { createClient, loginClient } from "./core/client";
import { connectDatabase } from "./core/database";
import { registerEventHandlers } from "./core/eventHandler";
import { initializeCronService } from "./services/cronService";
import { initializeDeployService } from "./services/deployService";

async function startBot(): Promise<void> {
  try {
    await connectDatabase();

    const client = createClient();
    registerEventHandlers(client);

    client.once("ready", async () => {
      console.log("✅ Bot is online.");
      console.log(`✅ Logged in as ${client.user?.tag}`);
      
      await initializeDeployService();
      await initializeCronService();
    });

    await loginClient(client);

  } catch (error) {
    console.error("❌ Failed to start bot:", error);
    process.exit(1);
  }
}

// Start the application
startBot();