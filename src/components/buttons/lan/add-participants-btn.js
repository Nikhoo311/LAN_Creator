const { MessageFlags, EmbedBuilder } = require('discord.js');
const { Types } = require('mongoose');

module.exports = {
    data: {
        name: "add-participants-btn"
    },
    async execute (interaction, client) {
        const user = interaction.user;
        const lanId = interaction.channel.topic
        const lan = client.lans.get(lanId);

        if (lan.participants.includes(user.id)) {
            return await interaction.reply({ content: `❌ Impossible tu participes déjà à la LAN **${lan.name}**`, flags: [MessageFlags.Ephemeral] });
        }

        await lan.addParticipants(user.id);

        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(interaction.message.embeds[0].data.description + `\n<@${user.id}>`)

        await interaction.update({ embeds: [embed] });
    }
}