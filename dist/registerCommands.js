"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const devGuildId = process.env.DISCORD_GUILD_ID;
const commands = [
    new discord_js_1.SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
    new discord_js_1.SlashCommandBuilder().setName("whoami").setDescription("What is Eleet?"),
    new discord_js_1.SlashCommandBuilder().setName("allquestions").setDescription("Get all questions."),
    new discord_js_1.SlashCommandBuilder().setName("daily").setDescription("Show today's daily LeetCode question.")
].map(c => c.toJSON());
const rest = new discord_js_1.REST({ version: "10" }).setToken(token);
(async () => {
    try {
        console.log("Registering commands...");
        await rest.put(discord_js_1.Routes.applicationGuildCommands(clientId, devGuildId), { body: commands });
        console.log("✅ Commands registered to dev guild");
    }
    catch (err) {
        console.error(err);
    }
})();
