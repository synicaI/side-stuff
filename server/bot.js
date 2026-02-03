const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// ====== CONFIG ======
const PANEL_CHANNEL_ID = "1468252557993574452"; // the channel where panel will be sent

client.once('ready', async () => {
    console.log(`Discord Bot Online as ${client.user.tag}`);

    try {
        // Get the channel
        const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
        if (!channel) return console.error("Channel not found");

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle("Auth Panel")
            .setDescription("Generate or revoke keys")
            .setColor(0x2b2d31);

        // Create buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("gen_key")
                .setLabel("Generate Key")
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId("revoke_key")
                .setLabel("Revoke Key")
                .setStyle(4)
        );

        // Send embed + buttons
        await channel.send({ embeds: [embed], components: [row] });
        console.log("Panel sent to channel successfully!");
    } catch (err) {
        console.error("Failed to send panel:", err);
    }
});

// Login using BOT_TOKEN from Railway env vars
client.login(process.env.BOT_TOKEN);
