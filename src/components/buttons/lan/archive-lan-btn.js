const { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");

module.exports = {
    data: {
        name: "archive-lan-btn"
    },
    async execute (interaction, client) {
        const lanName = interaction.message.content.split("# Informations sur `")[1].split("`")[0];

        const message = `# Espace d'archivage des LANs : \`${lanName}\`\nCeci est un espace qui permet d'archiver une lan facilement en un clic ! La LAN \`${lanName}\` se clotura dans les 48h qui suit la demande d'archivage.\n\n# Informations\nPour archiver une LAN, il suffit de cliquer sur le bouton \`\`Oui\`\`. Une fois la demande d'archivage fait et le délai dépasser, tous les membres ne pourront plus parler dans les salons textuels et les salons vocaux seront supprimés.\n\n\`\`\`\nEs-tu sûr de bien vouloir archiver ${lanName} ?\`\`\``
        
        const yesBtn = new ButtonBuilder()
            .setCustomId("archive-yes-btn")
            .setStyle(ButtonStyle.Success)
            .setLabel("Oui")
            .setEmoji("✅")
        
        const noBtn = new ButtonBuilder()
            .setCustomId("archive-no-btn")
            .setStyle(ButtonStyle.Danger)
            .setLabel("Non")
            .setEmoji("✖️")    
        interaction.update({ content: message, components: [new ActionRowBuilder().addComponents(yesBtn).addComponents(noBtn)], flags: [MessageFlags.Ephemeral] });
    }
}