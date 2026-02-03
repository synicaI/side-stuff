const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');
const db = require('../server/db'); // SQLite DB

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const PANEL_CHANNEL_ID = "1468252557993574452";
const ROLE_ID = "1468263997014020240";

let lastPanelMessageId = null; // track last panel sent

client.once('ready', async () => {
    console.log(`✅ Discord Bot Online as ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(PANEL_CHANNEL_ID);
        if (!channel) return console.error("❌ Panel channel not found");

        // Delete previous panel if exists
        if (lastPanelMessageId) {
            try { 
                const oldMsg = await channel.messages.fetch(lastPanelMessageId);
                if (oldMsg) await oldMsg.delete();
            } catch { /* ignore if not found */ }
        }

        // Create panel embed
        const embed = new EmbedBuilder()
            .setTitle("Auth Panel")
            .setDescription("Authenticate your Roblox key or get your script")
            .setColor(0x2b2d31);

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

        // Send new panel
        const msg = await channel.send({ embeds: [embed], components: [row] });
        lastPanelMessageId = msg.id;
        console.log("✅ Panel sent successfully!");

        // Collector for buttons
        const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 0 });

        collector.on('collect', async (buttonInteraction) => {

            if (buttonInteraction.customId === "auth_key") {
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

            } else if (buttonInteraction.customId === "get_script") {
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

    } catch (err) {
        console.error("❌ Failed to send panel:", err);
    }
});

// Modal submission
client.on('interactionCreate', async modalInteraction => {
    if (modalInteraction.type !== InteractionType.ModalSubmit) return;
    if (modalInteraction.customId !== "modal_auth") return;

    const key = modalInteraction.fields.getTextInputValue("user_key");

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
        const role = modalInteraction.guild.roles.cache.get(ROLE_ID);
        if (!role) return modalInteraction.reply({ content: "❌ Role not found", ephemeral: true });

        await member.roles.add(role);
        modalInteraction.reply({ content: `✅ Key authenticated! You now have the role.`, ephemeral: true });
    });
});

client.login(process.env.BOT_TOKEN);
