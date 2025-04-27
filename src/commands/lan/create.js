const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require("discord.js");

module.exports = {
    name: "create",
    categorie: "LAN",
    data: new SlashCommandBuilder()
        .setName("create")
        .setDescription('Permet de créer une LAN'),

    async execute(interaction, client) {
        const messageConfig = `# Espace de création et configuration de LAN\nCeci est un espace réserver aux créateur de LAN expérimenté ! (c'est faux tous le monde peut le faire :joy:). Sur cette espace on peut créer des LAN facilement et rapidement, avec toute simplicité !\n\n\`\`\`\n🟨 Il faut faire attention que je sois bien ligne pour que tout fonctionne correctement !\n\nDans le cas ou je suis hors ligne, il faut contacter Nikho311\`\`\`\n\n# Informations\n* Pour **créer** une LAN, tu peux cliquer le bouton \`Créer une LAN\` et remplir les informations nécessaire pour une LAN.\n* Pour **configurer** et / ou **modifier** les informations générales d'une LAN, cliquez sur le bouton \`Configurer\`.\n* Pour **consulter** toutes les informations relatives aux LAN en cours`

        const creationButton = new ButtonBuilder()
            .setCustomId('create-lan-btn')
            .setEmoji("🎮")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Créer une LAN")

        const configButton = new ButtonBuilder()
            .setCustomId("config-lan-btn")
            .setEmoji("⚙")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Configurer")

        const archiveButton = new ButtonBuilder()
            .setCustomId("informations-lan-btn")
            .setEmoji("ℹ️")
            .setStyle(ButtonStyle.Primary)
            .setLabel("Infos sur les LAN actives")
        
        interaction.channel.send({content: messageConfig, components: [new ActionRowBuilder().addComponents(creationButton).addComponents(configButton).addComponents(archiveButton)]})
        interaction.reply({content: "✅ Le message à bien été envoyer avec succès !", flags: [MessageFlags.Ephemeral]})
    }
}