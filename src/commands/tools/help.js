const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const { color } = require('../../../config/config.json');

module.exports = {
    name: "help",
    categorie: "Utilitaires",
    active: true,
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription('Permet d\'afficher les commandes disponibles !'),

    async execute(interaction, client) {
        const { commands } = client;
        
        const groupedByCategory = {};

        commands.forEach(command => {
            const category = command.categorie;
        
            if (!groupedByCategory[category]) {
                groupedByCategory[category] = [];
            }
        
            groupedByCategory[category].push(command);
        });
        
        let description = `\n`;
        for (const [key, cmds] of Object.entries(groupedByCategory)) {
            description += `## __${key}__\n`
            for (const cmd of cmds) {
              description += `**/${cmd.name}**\n-# ${cmd.data.description}\n\n`;
            }
          }
          
        const helpEmbed = new EmbedBuilder()
            .setColor(color.orange)
            .setAuthor({ name: "📙 Commandes disponibles" })
            // limitation 4096 characters
            .setDescription("**Voici une liste des commandes que tu peux utiliser**\nN\'hésite pas à les tester pour mieux comprendre !" + description)
            .setFooter({ text: "Besoin d'aide ? Débrouille toi !" })

        // Faire un systeme de selection de catégorie -> update embed => commandes de la catégorie
        await interaction.reply({ embeds: [helpEmbed], flags: [MessageFlags.Ephemeral] });
    }
}