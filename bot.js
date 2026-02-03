const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log('Discord Bot Online')); // <- optional: rename message

client.login(process.env.BOT_TOKEN); // Discord token from Railway environment variable
