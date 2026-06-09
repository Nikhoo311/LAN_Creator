const { ActionRowBuilder, TextDisplayBuilder, MessageFlags, ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "add-lan-voice-channels-btn",
        multi: "retry-add-lan-voice-channels-btn"
    },
    async execute(interaction, client) {
        const generalChannel = interaction.channel?.parent;
        const lanId = generalChannel?.topic;
        const lan = getLanForGuild(client, lanId, interaction.guildId);
        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        if (lan.channels.length > 25) {
            return interaction.reply({ content: "❌ La LAN comporte beaucoup de salon textuel (+25 salons textuels). Impossible d'ajouter d'avantage de salons.", flags: [MessageFlags.Ephemeral] });
        }

        const text = new TextDisplayBuilder({ content: "Envoie le nom du salon vocal que tu souhaites ajouter à la LAN, il sera précédé de \"🔊\".\nExemple : `🔊 Vocal tournois`\n\nSeul le nom du salon est requis (ex : `tournois`, `salon-équipe`, etc.).\n\n-# Chaque nom de salon doit être **unique** au sein de la LAN\n\n-# ⚠️ Temps maximum de saisie : 15 secondes" });
        
        if (interaction.customId === "retry-add-lan-voice-channels-btn") {
            await interaction.update({ components: [text], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]});
        } else {
            await interaction.reply({ components: [text], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]});
        }
        
        const filter = (msg) => msg.author.id === interaction.user.id;
        
        const collector = interaction.channel.createMessageCollector({
            filter,
            max: 1,
            time: 15_000
        });
        
        collector.on('collect', async (msg) => {
            await msg.delete().catch(() => {});
            const channelName = msg.content.trim();
            
            try {
                if (channelName.length >= 60) {
                    throw new Error("Le nom du salon est trop grand... (max 60 caractères).");
                }
                await lan.addChannel(channelName, interaction.guild, ChannelType.GuildVoice);
                const textSuccess = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n+ Le salon 🔊 ${channelName} a été créé avec succès !\`\`\``} )
                
                const container = new ContainerBuilder()
                    .addTextDisplayComponents(textSuccess);
                await interaction.editReply({ components: [container], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
            } catch (error) {
                const textError = new TextDisplayBuilder({ content: `# Informations\n\`\`\`diff\n- Une erreur est survenue lors de l'ajout du salon dans la LAN \`${lan.name}\`. Veuillez réessayer.\n\nErreur :\n${error.message}\`\`\`` });
                const separator = new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
                const retryButton = new ButtonBuilder()
                    .setCustomId("retry-add-lan-voice-channels-btn")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🔁")
                    .setLabel("Réessayer")
                
                const containerError = new ContainerBuilder()
                    .addTextDisplayComponents(textError)
                    .addSeparatorComponents(separator)
                    .addActionRowComponents(new ActionRowBuilder().addComponents(retryButton));
                return await interaction.editReply({ components: [containerError], flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] });
            }
        });
        
        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                const textEnd = new TextDisplayBuilder({ content: `⏱️ Temps écoulé, aucun ajout de salon dans ${lan.name}`})
                interaction.editReply({ components: [textEnd], flags: [MessageFlags.IsComponentsV2] }).catch(() => {});
            }
        });
    }
}