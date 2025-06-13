const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require("discord.js");
const { color } = require("../../../../config/config.json");

module.exports = {
    data: {
        name: "select-info-lan"
    },
    async execute(interaction, client) {
        const info = interaction.values[0]
        const lan = client.lans.get(info)

        const message = `# Espace d'informations des LANs actives\nCeci est un espace qui permet d'avoir accès à toutes les informations relative à une LAN en cours. Il est **important** de savoir que s'il y a qu'une seule LAN en cours, ses informations et les actions possible dessus s'afficherons automatiquement. Dans le cas contraire, il suffira de sélectionner une LAN.\n\n# Informations sur \`${lan.name}\``

        try {
            const channelVoiceState = lan.channels.voice.length > 1 ? "Les salons vocaux" : "Le salon vocal"

            let vcString = ""
            lan.channels.voice.forEach(ch => vcString += `<#${ch}>\n`)

            let endedState = lan.endedAt ? `<t:${lan.endedAt}>` : "⌛ toujours en cours...";
            
            const infoEmbed = new EmbedBuilder()
                .setColor(color.blue)
                .addFields(
                {
                    name: `**Les salons textuels :**`, value: `<#${lan.channels.general}>\n<#${lan.channels.information}>\n<#${lan.channels.picture}>\n<#${lan.channels.logistique}>`, inline: true
                }, {
                    name: `**${channelVoiceState} :**`, value: `${vcString}`, inline: true
                },
                { name: "**Début le :**", value: `<t:${lan.startedAt}>` },
                { name: "**Fin le :**", value: `${endedState}` },
            )

            const archivageBtn = new ButtonBuilder()
                .setCustomId("archive-lan-btn")
                .setLabel("Archiver la LAN")
                .setEmoji("📂")
                .setStyle(ButtonStyle.Success)
            if (lan.endedAt) {
                archivageBtn.setDisabled(true)
            }
            interaction.update({ content: `${message}`, embeds: [infoEmbed], components: [new ActionRowBuilder().addComponents(archivageBtn)], flags: [MessageFlags.Ephemeral]})
            
        } catch (error) {
            interaction.reply({ content: "❌ Un erreur est survenu lors de l'écriture dans le fichier de configuration !\n" + error, flags: [MessageFlags.Ephemeral] })
        }
    }
}