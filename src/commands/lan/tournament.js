const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { color } = require('../../../config/config.json');
const os = require('os');

module.exports = {
    name: "tournament",
    categorie: "LAN",
    data: new SlashCommandBuilder()
        .setName("tournament")
        .setDescription('Permet gérer les tounois'),

    async execute(interaction, client) {
        const message = `# Espace de création de Tournois\nUn espace dédié à la création et à la gestion de tournois, de manière simple, rapide et efficace.\n\n\`\`\`\n🟨 Il faut faire attention que je sois bien ligne pour que tout fonctionne correctement !\n\nDans le cas ou je suis hors ligne, il faut contacter Nikho311\`\`\`\n\n# Informations\n`

        const createTournamentBtn = new ButtonBuilder()
            .setCustomId("create-tournament-btn")
            .setLabel("Créer un Tournois")
            .setEmoji('🎮')
            .setStyle(ButtonStyle.Primary)
        
        const listTournamentBtn = new ButtonBuilder()
            .setCustomId("list-tournament-btn")
            .setLabel("Liste des Tournois")
            .setEmoji('ℹ️')
            .setStyle(ButtonStyle.Primary)
        
        const supprTournamentBtn = new ButtonBuilder()
            .setCustomId("suppr-tournament-btn")
            .setLabel("Supprimer un Tournois")
            .setEmoji('✖️')
            .setStyle(ButtonStyle.Danger)

        await interaction.channel.send({content: message, components: [new ActionRowBuilder().addComponents(createTournamentBtn).addComponents(listTournamentBtn).addComponents(supprTournamentBtn)]})
        await interaction.reply({content: "✅ Le message à bien été envoyer avec succès !", flags: [MessageFlags.Ephemeral]})
    }
}