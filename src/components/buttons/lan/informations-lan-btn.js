const { ActionRowBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { color } = require("../../../../config/config.json");
const { lansForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "informations-lan-btn"
    },
    async execute (interaction, client) {
        const bd = lansForGuild(client, interaction.guildId);
        
        if (bd.length === 0) {
            return interaction.reply({ content: "❌ Je ne dispose d'aucune LAN active... Pour avoir accès à cette partie, il faut créer une LAN et toutes les informaitons y seront afficher.", flags: [MessageFlags.Ephemeral] })
        }

        let message = `# Espace d'informations des LANs actives\nCeci est un espace qui permet d'avoir accès à toutes les informations relative à une LAN en cours. Il est **important** de savoir que s'il y a qu'une seule LAN en cours, ses informations et les actions possible dessus s'afficherons automatiquement. Dans le cas contraire, il suffira de sélectionner une LAN.`
        
        if(bd.length > 1) {
            // Si plusieurs alors select sinon direct les info avec btn archivage
            let namesInBD = "";
            bd.forEach(lan => namesInBD += `* **${lan.name}**\n`)
            
            const embedConfig = new EmbedBuilder()
                .setColor(color.blue)
                .setDescription(`Il y a ${bd.length} Lans actives\n${namesInBD}`)
            
            const selectInput = new StringSelectMenuBuilder()
                .setCustomId("select-info-lan")
                .setMaxValues(1)
                .setMinValues(1)
            
            bd.forEach(k => {
                selectInput.addOptions(new StringSelectMenuOptionBuilder({
                    label: k.name,
                    value: String(k.id)
                }).setEmoji('🎮'))
            })
            return interaction.reply({ content: message, embeds: [embedConfig], components: [new ActionRowBuilder().addComponents(selectInput)], flags: [MessageFlags.Ephemeral] })
        }
        const lan = bd[0];
        message += `\n\n# Informations sur \`${lan.name}\``
        const channelVoiceState = lan.channels.filter(ch => ch.name.includes("Vocal")).length > 1 ? "Les salons vocaux" : "Le salon vocal"

        let vcString = lan.channels.filter(ch => ch.name.includes("Vocal")).map(ch => `<#${ch.channelId}>`).join("\n");

        let endedState = lan.endedAt ? `<t:${lan.endedAt}>` : "⌛ toujours en cours...";

        const infoEmbed = new EmbedBuilder()
            .setColor(color.blue)
            .addFields(
            {
                name: `**Les salons textuels :**`, value: `${lan.channels.filter(ch => !ch.name.includes("Vocal")).map(ch => `<#${ch.channelId}>`).join("\n")}`, inline: true
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

        return interaction.reply({ content: message, embeds: [infoEmbed], components: [new ActionRowBuilder().addComponents(archivageBtn)], flags: [MessageFlags.Ephemeral] })
    }
}