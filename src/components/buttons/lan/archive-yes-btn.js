const { EmbedBuilder, MessageFlags } = require("discord.js");
const LanModel = require("../../../schemas/lan");

module.exports = {
    data: {
        name: "archive-yes-btn"
    },
    async execute (interaction, client) {
        const lanName = interaction.message.content.split("# Espace d'archivage des LANs : `")[1].split("`")[0];

        const message = `# Espace d'archivage des LANs : \`${lanName}\`\nCeci est un espace qui permet d'archiver une lan facilement en un clic ! La LAN \`${lanName}\` se clotura dans les 48h qui suit la demande d'archivage.\n\n# Informations\n\`\`\`diff\n+ ${lanName} à bien été archiver avec succès !\`\`\``
        
        const lan = await client.lans.find((lan) => lan.name === lanName);
        
        lan.end(2);
        // Update in collection
        client.lans.delete(lan.id);
        client.lans.set(lan.id, lan);

        await LanModel.findByIdAndUpdate(lan.id, {
            endedAt: new Date(lan.endedAt * 1000)
        })
        const embedData = interaction.message.embeds[0].data;
        
        const channelVoiceState = lan.channels.filter(ch => ch.name.includes("Vocal")).length > 1 ? "Les salons vocaux" : "Le salon vocal"
        const vcString = lan.channels.filter(ch => ch.name.includes("Vocal")).map(ch => `<#${ch.channelId}>`).join("\n");
        
        const embed = new EmbedBuilder(embedData)
            .setColor(embedData.color)
            .setFields(
                {
                    name: `**Les salons textuels :**`, value: `${lan.channels.filter(ch => !ch.name.includes("Vocal")).map(ch => `<#${ch.channelId}>`).join("\n")}`, inline: true
                }, {
                    name: `**${channelVoiceState} :**`, value: `${vcString}`, inline: true
                },
                { name: "**Début le :**", value: `<t:${lan.startedAt}>` },
                { name: "**Fin le :**", value: `<t:${lan.endedAt}>` },
            )
        interaction.update({ content: message, embeds: [embed], components: [], flags: [MessageFlags.Ephemeral] });
    }
}