const { MessageFlags, ContainerBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, OverwriteType, PermissionFlagsBits } = require('discord.js');
const { LABEL_PERMISSIONS } = require("../../../functions/utils/mapPermissions");
const { getLanForGuild } = require("../../../functions/utils/guildCache");

module.exports = {
    data: {
        name: "switch-permission-btn",
        dynamic: true
    },
    async execute (interaction, client) {
        await interaction.deferUpdate();
        const permission = LABEL_PERMISSIONS[interaction.component.label];
        const generalChannel = interaction.channel?.parent;
        const category = generalChannel?.parent;

        const lanId = generalChannel?.topic;
        const lan = getLanForGuild(client, lanId, interaction.guildId);

        if (!lan) {
            return interaction.channel.send({ content: "❌ LAN introuvable sur ce serveur.", flags: [MessageFlags.Ephemeral] });
        }

        const everyoneOverwrite = category.permissionOverwrites.cache.find(overwrite => overwrite.id === category.guild.roles.everyone.id);

        const currentAllow = everyoneOverwrite?.allow.has(permission) ?? false;

        if (permission === PermissionFlagsBits.ViewChannel || permission === PermissionFlagsBits.Connect) {
            if (currentAllow) {
                // @everyone had access -> close it, grant access to participants only
                await category.permissionOverwrites.edit(category.guild.roles.everyone, {
                    [permission]: false
                });

                await category.fetch();

                await Promise.all(lan.participants.map(async memberId => {
                    const member = await interaction.guild.members.fetch(memberId).catch(() => null);
                    if (!member) return;
                    await category.permissionOverwrites.edit(member, { [permission]: true });
                }));
            } else {
                // @everyone had no access -> open it, remove participants overwrites
                await category.permissionOverwrites.edit(category.guild.roles.everyone, {
                    [permission]: true
                });

                await category.fetch();

                const memberOverwrites = category.permissionOverwrites.cache.filter(overwrite =>
                    overwrite.type === OverwriteType.Member
                );
                await Promise.all(memberOverwrites.map(overwrite => overwrite.delete()));
            }
        } else {
            // Other permissions -> simply toggle @everyone
            await category.permissionOverwrites.edit(category.guild.roles.everyone, {
                [permission]: currentAllow ? false : true
            });
        }

        const containerData = interaction.message.components[0].toJSON();

        containerData.components = containerData.components.map(component => {
            if (component.type !== ComponentType.ActionRow) return component;

            component.components = component.components.map(btn => {
                if (btn.custom_id === interaction.customId) {
                    btn.style = currentAllow ? ButtonStyle.Danger : ButtonStyle.Success;
                }
                return btn;
            });

            return component;
        });

        const newContainer = new ContainerBuilder(containerData);

        return await interaction.message.edit({ components: [newContainer], flags: [MessageFlags.IsComponentsV2] });
    }
}