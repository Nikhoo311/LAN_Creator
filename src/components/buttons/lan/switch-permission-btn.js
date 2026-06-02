const { MessageFlags, ContainerBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const { LABEL_PERMISSIONS } = require("../../../functions/utils/mapPermissions");

module.exports = {
    data: {
        name: "switch-permission-btn",
        dynamic: true
    },
    async execute (interaction, client) {
        await interaction.deferUpdate();
        const permission = LABEL_PERMISSIONS[interaction.component.label];
        const category = interaction.channel?.parent.parent;

        const currentAllow = category.permissionOverwrites.cache
            .find(overwrite => overwrite.id === category.guild.roles.everyone.id)
            ?.allow.has(permission) ?? false;

        await category.permissionOverwrites.edit(category.guild.roles.everyone, {
            [permission]: currentAllow ? false : true
        });

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

        await interaction.message.edit({ components: [newContainer], flags: [MessageFlags.IsComponentsV2] });
    }
}