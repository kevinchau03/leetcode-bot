"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const showAll_1 = require("./commands/showAll");
const daily_1 = require("./commands/daily");
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds], // enough for slash commands
});
client.once("ready", () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
});
// Connect to MongoDB
if (!config_1.MONGODB_URI) {
    throw new Error("❌ MONGODB_URI environment variable is not defined.");
}
mongoose_1.default.connect(config_1.MONGODB_URI).then(() => {
    console.log("✅ Connected to MongoDB");
}).catch(err => {
    console.error("❌ MongoDB connection error:", err);
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    const { commandName } = interaction;
    switch (commandName) {
        case "ping":
            await interaction.reply("Pong! 🏓");
            break;
        case "whoami":
            await interaction.reply("I am Eleet, your coding companion! I provide users with daily leetcode challenges so that they can become elite! 🤖");
            break;
        case "allquestions":
            await (0, showAll_1.execute)(interaction);
            break;
        case "daily":
            await (0, daily_1.execute)(interaction);
            break;
        default:
            await interaction.reply({ content: "Unknown command", ephemeral: true });
            break;
    }
});
client.login(config_1.DISCORD_TOKEN);
