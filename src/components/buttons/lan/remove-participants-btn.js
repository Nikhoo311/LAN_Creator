const { MessageFlags, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "remove-participants-btn"
    },
    async execute (interaction, client) {
        const user = interaction.user;
        const lanId = interaction.channel.topic
        const lan = getLanForGuild(client, lanId, interaction.guildId);

        if (!lan) {
            return interaction.reply({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        if (!lan.participants.includes(user.id)) {
            return interaction.reply({ content: `❌ Impossible tu ne participes pas à cette LAN.`, flags: [MessageFlags.Ephemeral] });
        }

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        await lan.removeParticipants(user.id);

        let files = [];

        if (!lan.participants.length) {
            embed.setImage(null);
        } else {
            const participantsImage = await lan.generateParticipantsImage(interaction.guild, 64);
            const attachment = new AttachmentBuilder(participantsImage, { name: `${lan.id}_participants.png` });
            embed.setImage(`attachment://${attachment.name}`);
            files = [attachment];
        }

        await interaction.update({ embeds: [embed], files });
    }
}