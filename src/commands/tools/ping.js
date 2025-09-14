const { MessageFlags, SlashCommandBuilder } = require("discord.js");

module.exports = {
    name: "ping",
    categorie: "Utilitaires",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription('Permet d\'afficher le ping du bot !'),

    async execute(interaction, client) {
        await interaction.reply({ content: '🕒 Calcul du ping...', flags: [MessageFlags.Ephemeral] });

        const sent = await interaction.fetchReply();

        const apiPing = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing = interaction.client.ws.ping;
        const wsPingDisplay = wsPing === -1 ? 'Non disponible' : `${wsPing}ms`;

        const getSignalEmoji = (ping) => {
            if (ping <= 150) return '<:signalbar_green:1379563339868405960>';
            if (ping <= 250) return '<:signalbar_yellow:1379563467261874256>';
            if (ping <= 400) return '<:signalbar_orange:1379563394105081958>';
            return '<:signalbar_red:1379563519195742228>';
        };

        await interaction.editReply({
            content: `> ${getSignalEmoji(apiPing)} **API Ping** : \`${apiPing}ms\`\n> ${wsPing === -1 ? "❌" : getSignalEmoji(wsPing)} **WebSocket Ping** : \`${wsPingDisplay}\``
        });
    }
}