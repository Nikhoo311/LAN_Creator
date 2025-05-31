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
        const message = `# Espace de gestion de Tournois\nUn espace dédié à la gestion et à la gestion de tournois, de manière simple, rapide et efficace.\n\n\`\`\`\n🟨 Il faut faire attention que je sois bien ligne pour que tout fonctionne correctement !\n\nDans le cas ou je suis hors ligne, il faut contacter Nikho311\`\`\`\n\n# Informations\n* Pour **créer** un tournois, il suffit de cliquer sur le bouton \`Créer un Tournois\`. Ensuite, le chemain est tout tracer pour y arriver.\n* Pour **gérer** les points, etc d'un tournois, le bouton \`Gestion des Tournois\` est là pour ça.\n* Pour **supprimer** un tournois une fois que celui-ci est terminé, il faut cliquer sur \`Supprimer un Tounois\`, le processus est **irréverssible**.`

        const createTournamentBtn = new ButtonBuilder()
            .setCustomId("create-tournament-btn")
            .setLabel("Créer un Tournois")
            .setEmoji('🎮')
            .setStyle(ButtonStyle.Primary)
        
        const managementTournamentBtn = new ButtonBuilder()
            .setCustomId("manangement-tournament-btn")
            .setLabel("Gestion des Tournois")
            .setEmoji('⚙️')
            .setStyle(ButtonStyle.Secondary)
        
        const supprTournamentBtn = new ButtonBuilder()
            .setCustomId("suppr-tournament-btn")
            .setLabel("Supprimer un Tournois")
            .setEmoji('<:trash:1378419101751447582>')
            .setStyle(ButtonStyle.Danger)

        await interaction.channel.send({content: message, components: [new ActionRowBuilder().addComponents(createTournamentBtn).addComponents(managementTournamentBtn).addComponents(supprTournamentBtn)]})
        await interaction.reply({content: "✅ Le message à bien été envoyer avec succès !", flags: [MessageFlags.Ephemeral]})
    }
}