const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    name: 'panel',
    description: 'Manage keys',
    execute: async (interaction) => {
        const embed = new EmbedBuilder()
            .setTitle("Auth Panel")
            .setDescription("Generate or revoke keys")
            .setColor(0x2b2d31);

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

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};
