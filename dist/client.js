"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
// Replace with your bot token
const DISCORD_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});
client.on('messageCreate', (message) => {
    if (message.author.bot)
        return;
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});
client.login(DISCORD_BOT_TOKEN);
