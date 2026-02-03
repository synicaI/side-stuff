const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const db = require('../../server/db'); // import database

module.exports = {
    name: 'panel',
    description: 'Manage keys',
    execute: async (interaction) => {
        // Create embed
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

        // Send panel
        const msg = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

        // Create a collector for button clicks
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 0 });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === "gen_key") {
                // Generate a random 16-char key
                const key = Math.random().toString(36).substring(2, 18).toUpperCase();

                // Insert into database with expiry 7 days from now
                const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
                db.run("INSERT INTO users (key, expires) VALUES (?, ?)", [key, expires], (err) => {
                    if (err) {
                        buttonInteraction.reply({ content: "❌ Failed to generate key", ephemeral: true });
                    } else {
                        buttonInteraction.reply({ content: `✅ Key generated: \`${key}\` (expires in 7 days)`, ephemeral: true });
                    }
                });

            } else if (buttonInteraction.customId === "revoke_key") {
                // Ask user for key to revoke
                buttonInteraction.reply({ content: "❌ Revoke function not fully interactive in buttons yet. Use /revoke <key> command or add modal.", ephemeral: true });
            }
        });
    }
};
