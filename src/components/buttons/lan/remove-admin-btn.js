const { MessageFlags } = require('discord.js');

module.exports = {
    data: {
        name: "remove-admin-btn"
    },
    async execute(interaction, client) {
        const channel = interaction.channel;

        await channel.members.fetch();
        const membersBeforeCollect = new Set(channel.members.cache.keys());

        await interaction.reply({ content: "Écris l'**ID** de l'utilisateur que tu souhaites retirer de ce fil de gestion\n\n-# Seul l'utilisateur avec cet ID pourra être retiré de ce fil de gestion\n-# ⚠️ Temps maximum de saisie : 30 secondes", flags: [MessageFlags.Ephemeral]});

        const filter = (msg) => msg.author.id === interaction.user.id;

        const collector = channel.createMessageCollector({
            filter,
            max: 1,
            time: 30_000
        });

        collector.on('collect', async (msg) => {
            await msg.delete().catch(() => {});

            const userId = msg.content.trim();

            if (!/^\d{17,19}$/.test(userId)) {
                return await interaction.editReply({ content: "❌ ID invalide. Un ID Discord contient uniquement des chiffres (17-19 caractères)." });
            }

            if (userId === interaction.user.id) {
                return await interaction.editReply({ content: "❌ Il n'est pas possible de vous retirer vous-même de ce fil." });
            }

            const member = await interaction.guild.members.fetch(userId).catch(() => null);

            if (!member) {
                return await interaction.editReply({ content: "❌ Aucun membre trouvé avec cet ID sur ce serveur." });
            }

            if (member.user.bot) {
                return await interaction.editReply({ content: "❌ Il n'est pas possible de retirer un bot de ce fil." });
            }

            if (!membersBeforeCollect.has(userId)) {
                return await interaction.editReply({ content: `❌ ${member} n'a pas accès à ce fil.` });
            }

            try {
                await channel.members.remove(userId);

                await interaction.editReply({ content: `✅ ${member} a été retiré de ce fil.` });

            } catch (error) {
                console.error("Erreur lors du retrait:", error);
                return await interaction.editReply({ content: "❌ Une erreur est survenue lors du retrait. Consultez la console pour plus de détails." });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                return interaction.editReply({ content: "⏱️ Temps écoulé, aucun admin retiré." }).catch(() => {});
            }
        });
    }
};