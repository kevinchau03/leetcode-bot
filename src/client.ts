import { Client, GatewayIntentBits } from 'discord.js';

// Replace with your bot token
const DISCORD_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});

client.login(DISCORD_BOT_TOKEN);