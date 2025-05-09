const { readdirSync } = require("fs");
const path = require("path");

module.exports = (client) => {
    client.handleComponents = async () => {
        const componentsPath = path.join(__dirname, "../..", "components");
        const componentsFolders = readdirSync(componentsPath);

        for (const folder of componentsFolders) {
            const folderPath = path.join(componentsPath, folder);
            const componentFiles = readdirSync(folderPath).filter(file => file.endsWith(".js"));

            const { buttons, modals, selectMenus } = client;

            switch (folder) {
                case "buttons":
                    for (const file of componentFiles) {
                        const filePath = path.join(folderPath, file);
                        const btn = require(filePath);
                        buttons.set(btn.data.name, btn);
                        if (btn.data.multi) {
                            buttons.set(btn.data.multi, btn);
                        }
                    }
                    break;

                case "modals":
                    for (const file of componentFiles) {
                        const filePath = path.join(folderPath, file);
                        const modal = require(filePath);
                        modals.set(modal.data.name, modal);
                    }
                    break;

                case "selectMenus":
                    for (const file of componentFiles) {
                        const filePath = path.join(folderPath, file);
                        const selectMenu = require(filePath);
                        selectMenus.set(selectMenu.data.name, selectMenu);

                        if (selectMenu.data.multi) {
                            selectMenus.set(selectMenu.data.multi, selectMenu);
                        }
                    }
                    break;

                default:
                    break;
            }
        }
    };
};
