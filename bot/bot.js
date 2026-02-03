const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

// ===== CONFIG =====
const PANEL_CHANNEL_ID = "1468252557993574452"; // Channel where panel will be sent

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

client.once('ready', async () => {
    console.log(`✅ Discord Bot Online as ${client.user.tag}`);

    try {
        // Fetch the channel
        const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
        if (!channel) return console.error("❌ Panel channel not found");

        // Build embed
        const embed = new EmbedBuilder()
            .setTitle("Auth Panel")
            .setDescription("Generate or revoke keys")
            .setColor(0x2b2d31);

        // Buttons
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

        // Send the panel
        await channel.send({ embeds: [embed], components: [row] });
        console.log("✅ Panel sent successfully!");
    } catch (err) {
        console.error("❌ Failed to send panel:", err);
    }
});

// Login using BOT_TOKEN from Railway env vars
client.login(process.env.BOT_TOKEN);

module.exports = client; // export client for server use if needed
