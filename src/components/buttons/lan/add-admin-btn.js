const { MessageFlags } = require('discord.js');

module.exports = {
    data: {
        name: "add-admin-btn"
    },
    async execute(interaction, client) {
        const channel = interaction.channel;

        await interaction.reply({ content: "Envoie l'**ID** de l'utilisateur que tu souhaites ajouter en tant qu'administrateur de ce fil de gestion\n\n-# Seul l'utilisateur mentionné pourra accéder à ce fil de gestion et utiliser les commandes de gestion de la LAN\n-# ⚠️ Temps maximum de saisie : 30 secondes", flags: [MessageFlags.Ephemeral]});

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
                return await interaction.editReply({ content: "❌ Il n'est pas possible de vous ajouter vous-même à ce fil." });
            }

            try {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);

                if (!member) {
                    return await interaction.editReply({ content: "❌ Aucun membre trouvé avec cet ID sur ce serveur." });
                }

                if (member.user.bot) {
                    return await interaction.editReply({ content: "❌ Il n'est pas possible d'ajouter un bot à ce fil." });
                }

                await channel.members.fetch();
                if (channel.members.cache.has(userId)) {
                    return await interaction.editReply({ content: `❌ ${member} est déjà membre de ce fil.` });
                }

                await channel.members.add(userId);

                await interaction.editReply({ content: `✅ ${member} a été ajouté à ce fil.`});

            } catch (error) {
                console.error("Erreur lors de l'ajout:", error);
                await interaction.editReply({ content: "❌ Une erreur est survenue lors de l'ajout. Consultez la console pour plus de détails." });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                interaction.editReply({ content: "⏱️ Temps écoulé, aucun admin ajouté." }).catch(() => {});
            }
        });
    }
};