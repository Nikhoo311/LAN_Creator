const { MessageFlags, ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");
const logger = require("../../../functions/utils/Logger");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "lan-management-btn"
    },
    async execute (interaction, client) {
        await interaction.deferUpdate();

        const generalChannel = interaction.channel?.parent;
        const lanId = generalChannel?.topic;

        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.channel.send({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const text = new TextDisplayBuilder({ content: `Voici la liste des options possibles pour gérer la LAN :\n* 📝 Modifier la liste des participants\n* 🔒 Gestion des permissions de la LAN\n* 🖼️ Modifier le flyer\n* <:trash:1378419101751447582> Supprimer la LAN\n* <:add_participant:1472756154730938388> Ajouter un administrateur dans ce fil de gestion\n* <:remove_participant:1487896551316787220> Retirer un administrateur de ce fil de gestion\n* <:channel_add:1513283429930762482> Ajouter un salon **textuel**\n* <:channel_remove:1513283431684116541> Retirer / Supprimer un salon **textuel**\n* <:voice_add:1379566685681618975> Ajouter un salon **vocal**\n* <:voice_remove:1379573487655587921> Retirer / Supprimer un salon **vocal**\n\n-# La liste des options n'est pas définitive` });

        const deleteLanButton = new ButtonBuilder()
            .setCustomId("delete-lan-btn")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("<:trash:1378419101751447582>")

        const editParticipantsButton = new ButtonBuilder()
            .setCustomId("edit-participants-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("📝")
        
        const editPermissionsButton = new ButtonBuilder()
            .setCustomId("edit-permissions-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🔒")
        
        const removeAdminButton = new ButtonBuilder()
            .setCustomId("remove-admin-btn")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("<:remove_participant:1487896551316787220>")

        const addAdminButton = new ButtonBuilder()
            .setCustomId("add-admin-btn")
            .setStyle(ButtonStyle.Success)
            .setEmoji("<:add_participant:1472756154730938388>")

        const editFlyerButton = new ButtonBuilder()
            .setCustomId("edit-flyer-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🖼️")

        const addChannelsButton = new ButtonBuilder()
            .setCustomId("add-lan-channels-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("<:channel_add:1513283429930762482>")

        const removeChannelsButton = new ButtonBuilder()
            .setCustomId("remove-lan-channels-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("<:channel_remove:1513283431684116541>")

        const addVoiceChannelsButton = new ButtonBuilder()
            .setCustomId("add-lan-voice-channels-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("<:voice_add:1379566685681618975>")

        const removeVoiceChannelsButton = new ButtonBuilder()
            .setCustomId("remove-lan-voice-channels-btn")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("<:voice_remove:1379573487655587921>")

        const buttons = [
            editParticipantsButton,
            editPermissionsButton,
            editFlyerButton,
            deleteLanButton,
            addAdminButton,
            removeAdminButton,
            addChannelsButton,
            removeChannelsButton,
            addVoiceChannelsButton,
            removeVoiceChannelsButton
        ];

        const rows = [];
        for (let i = 0; i < buttons.length; i += 4) {
            rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 4)));
        }

        const separator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        const container = new ContainerBuilder()
            .addTextDisplayComponents(text)
            .addSeparatorComponents(separator)
            .addActionRowComponents(...rows);
        
        return await interaction.channel.send({ components: [container], flags: [MessageFlags.IsComponentsV2] });
    }
}