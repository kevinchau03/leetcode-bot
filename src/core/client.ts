import { Client, GatewayIntentBits } from "discord.js";
import { DISCORD_TOKEN } from "../config";

export function createClient(): Client {
  return new Client({
    intents: [GatewayIntentBits.Guilds],
  });
}

export async function loginClient(client: Client): Promise<void> {
  await client.login(DISCORD_TOKEN);
}