const { TextDisplayBuilder, MessageFlags, ButtonStyle, ButtonBuilder, SeparatorBuilder, ContainerBuilder, SeparatorSpacingSize, ActionRowBuilder, ChannelType } = require("discord.js");
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "select-remove-channel",
    },
    async execute(interaction, client) {
        const channelIds = interaction.values;
        
        const generalChannel = interaction.channel?.parent;
        const lanId = generalChannel?.topic;
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        try {
            await lan.removeChannels(channelIds, interaction.guild);
            let message = channelIds.length === 1 ? `Le salon a bien été retier !` : `${channelIds.length} salons ont été retier avec succès !`;

            const textSuccess = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n+ ${message}\`\`\``} )
            
            const container = new ContainerBuilder()
                .addTextDisplayComponents(textSuccess);
            await interaction.update({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
        } catch (error) {
            const textError = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n- Une erreur est survenue lors du retrait du salon dans la LAN \`${lan.name}\`. Veuillez réessayer.\n\nErreur :\n${error.message}\`\`\`` });
            const separator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
            
            const alwaysActiveNames = new Set(
                lan.config.channels.filter(c => c.alwaysActive).map(c => c.name)
            );

            const editableChannels = lan.channels.filter(ch => {
                if (alwaysActiveNames.has(ch.name)) return false;
                const discordChannel = interaction.guild.channels.cache.get(ch.channelId);
                return discordChannel?.type === ChannelType.GuildText;
            });
            
            const retryButton = new ButtonBuilder()
                .setCustomId("retry-remove-lan-channels-btn")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🔁")
                .setLabel("Réessayer")
                .setDisabled(editableChannels.length < 1)
            
            const containerError = new ContainerBuilder()
                .addTextDisplayComponents(textError)
                .addSeparatorComponents(separator)
                .addActionRowComponents(new ActionRowBuilder().addComponents(retryButton));
            return await interaction.update({ components: [containerError], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
        }
    }
}