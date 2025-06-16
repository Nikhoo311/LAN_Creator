const { EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
    data: {
        name: "change-stats-match"
    },
    async execute(interaction, client) {

        const scoreTeamA = interaction.fields.getTextInputValue("score_A");
        const scoreTeamB = interaction.fields.getTextInputValue('score_B');

        if(isNaN(Number(scoreTeamA)) || isNaN(Number(scoreTeamB))) {
            return await interaction.reply({ content: "❌ Erreur de saisie... Merci de saisir uniquement des nombres.", flags: [MessageFlags.Ephemeral] });
        }

        const embedStats = interaction.message.embeds[0];
        embedStats.data.description = `# Score : ${scoreTeamA} - ${scoreTeamB}`;

        const embedStatsEdited = new EmbedBuilder(embedStats.data);
        return await interaction.update({ content: interaction.message.content, embeds: [embedStatsEdited], components: interaction.message.components });
    }
}