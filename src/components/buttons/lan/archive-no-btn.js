const { MessageFlags } = require('discord.js');

module.exports = {
    data: {
        name: "archive-no-btn"
    },
    async execute (interaction, client) {
        const lanName = interaction.message.content.split("# Espace d'archivage des LANs : `")[1].split("`")[0];

        const message = `# Espace d'archivage des LANs : \`${lanName}\`\nCeci est un espace qui permet d'archiver une lan facilement en un clic ! La LAN \`${lanName}\` se clotura dans les 48h qui suit la demande d'archivage.\n\n# Informations\n\`\`\`diff\n- Annulation de l'archiavge de ${lanName}\`\`\``
        interaction.update({ content: message, embeds: [], components: [], flags: [MessageFlags.Ephemeral] });
    }
}