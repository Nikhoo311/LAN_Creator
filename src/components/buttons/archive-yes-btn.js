const { EmbedBuilder, MessageFlags } = require("discord.js");
const { Lan } = require("../../class/Lan");

module.exports = {
    data: {
        name: "archive-yes-btn"
    },
    async execute (interaction, client) {
        const lanName = interaction.message.content.split("# Espace d'archivage des LANs : `")[1].split("`")[0];

        const message = `# Espace d'archivage des LANs : \`${lanName}\`\nCeci est un espace qui permet d'archiver une lan facilement en un clic ! La LAN \`${lanName}\` se clotura dans les 48h qui suit la demande d'archivage.\n\n## Informations\n\`\`\`diff\n+ ${lanName} à bien été archiver avec succès !\`\`\``
        
        const lan = Lan.getLanByName(lanName)
        lan.end()
        
        const updateLan = client.lans.get(lan.id);
        
        updateLan.endedAt = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60);
        
        // Update in collection
        client.lans.delete(lan.id);
        client.lans.set(lan.id, updateLan);
        
        const embedData = interaction.message.embeds[0].data;
        
        const channelVoiceState = lan.channels.voice.length > 1 ? "Les salons vocaux" : "Le salon vocal"
        let vcString = ""
        lan.channels.voice.forEach(ch => vcString += `<#${ch}>\n`)
        
        const embed = new EmbedBuilder(embedData)
            .setColor(embedData.color)
            .setFields(
                {
                    name: `**Les salons textuels :**`, value: `<#${lan.channels.general}>\n<#${lan.channels.information}>\n<#${lan.channels.picture}>\n<#${lan.channels.logistique}>`, inline: true
                }, {
                    name: `**${channelVoiceState} :**`, value: `${vcString}`, inline: true
                },
                { name: "**Début le :**", value: `<t:${lan.startedAt}>` },
                { name: "**Fin le :**", value: `<t:${updateLan.endedAt}>` },
            )
        interaction.update({ content: message, embeds: [embed], components: [], flags: [MessageFlags.Ephemeral] });
    }
}