const { MessageFlags } = require('discord.js');
const { LABEL_PERMISSIONS } = require("../../../functions/utils/mapPermissions");

module.exports = {
    data: {
        name: "switch-permission-btn",
        dynamic: true
    },
    async execute (interaction, client) {
        const permission = LABEL_PERMISSIONS[interaction.component.label];
        const generalChannel = interaction.channel?.parent;
    }
}