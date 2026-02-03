const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log('Discord Bot Online'));
client.login(process.env.BOT_TOKEN);
