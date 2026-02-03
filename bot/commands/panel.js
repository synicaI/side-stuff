const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');
const db = require('../../server/db'); // your SQLite database

module.exports = {
    name: 'panel',
    description: 'User authentication panel',
    execute: async (interaction) => {

        // Embed
        const embed = new EmbedBuilder()
            .setTitle("Auth Panel")
            .setDescription("Authenticate your Roblox key or get your script")
            .setColor(0x2b2d31);

        // Buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("auth_key")
                .setLabel("Authenticate Key")
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId("get_script")
                .setLabel("Get Script")
                .setStyle(2)
        );

        // Send panel
        const msg = await interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

        // Collector for buttons
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 0 });

        collector.on('collect', async (buttonInteraction) => {

            // ===== AUTHENTICATE KEY =====
            if (buttonInteraction.customId === "auth_key") {

                // Modal form
                const modal = new ModalBuilder()
                    .setCustomId("modal_auth")
                    .setTitle("Authenticate Roblox Key");

                const keyInput = new TextInputBuilder()
                    .setCustomId("user_key")
                    .setLabel("Enter your key")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder("XXXX-XXXX-XXXX")
                    .setRequired(true);

                const rowModal = new ActionRowBuilder().addComponents(keyInput);
                modal.addComponents(rowModal);

                await buttonInteraction.showModal(modal);

            }

            // ===== GET SCRIPT =====
            else if (buttonInteraction.customId === "get_script") {
                // Give them script text
                const script = `
print("ok")
-- Roblox authentication example
local HttpService = game:GetService("HttpService")
local KEY = "YOUR_KEY"
local SECRET = "YOUR_SECRET"
-- connect to your backend
                `;
                await buttonInteraction.reply({ content: "```lua\n" + script + "\n```", ephemeral: true });
            }

        });

        // ===== MODAL SUBMISSION =====
        interaction.client.on('interactionCreate', async modalInteraction => {
            if (modalInteraction.type !== InteractionType.ModalSubmit) return;
            if (modalInteraction.customId !== "modal_auth") return;

            const key = modalInteraction.fields.getTextInputValue("user_key");

            // Check DB
            db.get("SELECT * FROM users WHERE key = ?", [key], async (err, user) => {
                if (err || !user) {
                    return modalInteraction.reply({ content: "❌ Invalid key", ephemeral: true });
                }
                if (user.banned) {
                    return modalInteraction.reply({ content: "❌ This key is banned", ephemeral: true });
                }
                if (Date.now() > user.expires) {
                    return modalInteraction.reply({ content: "❌ Key expired", ephemeral: true });
                }

                // Assign role
                const member = await modalInteraction.guild.members.fetch(modalInteraction.user.id);
                const role = modalInteraction.guild.roles.cache.get("1468263997014020240");
                if (!role) return modalInteraction.reply({ content: "❌ Role not found", ephemeral: true });
                await member.roles.add(role);

                modalInteraction.reply({ content: `✅ Key authenticated! You now have access.`, ephemeral: true });
            });
        });

    }
};
