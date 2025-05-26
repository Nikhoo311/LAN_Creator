const { StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { readFileSync } = require("fs");

function generateSlug(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9\s_]/g, "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();
}

module.exports = {
    data: {
        name: "select-lan-for-tournament"
    },
    async execute(interaction, client) {
        const info = interaction.values[0]
        const lan = client.lans.get(info)
        const possibleGamesChoices = JSON.parse(readFileSync(`./config/bd.json`, "utf-8"))["tournamentGames"];
        const message = `# Création de Tournois pour \`\`${lan.name}\`\`\nCet espace est dédié à la création de Tournois Multi-jeux !\n# Informations :\nIl vous suffit de choisir le jeu sur lequel le tournoi sera organisé !\n`
        let selectGame = new StringSelectMenuBuilder()
            .setCustomId("select-game-tournament")
            .setMinValues(1)
            .setMaxValues(1)
            .setPlaceholder("Choisir un jeu")
        
        possibleGamesChoices.forEach(game => {
            selectGame.addOptions(
                new StringSelectMenuOptionBuilder()
                .setEmoji(game?.emoji)
                .setLabel(game.name)
                .setValue(generateSlug(game.name))
            )
        });
        return interaction.update({ content: message, components: [new ActionRowBuilder().addComponents(selectGame)] })
    }
}