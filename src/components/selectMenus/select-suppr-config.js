const { readFileSync, writeFile } = require("fs");
const { EmbedBuilder, MessageFlags } = require("discord.js");
const { color } = require("../../../config/config.json");

module.exports = {
    data: {
        name: "select-suppr-config"
    },
    async execute(interaction, client) {
        const info = interaction.values
        // Get the data base
        const file = JSON.parse(readFileSync("./config/bd.json", "utf-8"));

        function getInfoConfig(name) {
            let result;
            file["bd"].forEach(element => {
                if (element.name == name) {
                    result = element
                }
            });
            return result;
        }

        let arrayConfig = []
        let arrayInFile = []
        info.forEach(uneInfo => arrayConfig.push(getInfoConfig(uneInfo)))
        
        function sameProps(obj, source) {
            return Object.keys(source).every(key => obj.hasOwnProperty(key) && obj[key] === source[key])
        }

        file["bd"].forEach(config => {
            arrayConfig.forEach(element => {
                if (!sameProps(element, config) && !arrayInFile.includes(config) && !info.includes(config.name)) {
                    arrayInFile.push(config);
                }
            });
        });

        const message = `${arrayConfig.length > 1 ? "Les configurations ont" : "La configuration à" } bien été supprimé${arrayConfig.length > 1 ? "s" : ""} avec succès !`
        let namesInBD = "";
        arrayConfig.forEach(lan => namesInBD += `* **${lan.name}**\n`)

        const embedSuppr = new EmbedBuilder()
            .setColor(color.red)
            .setDescription(namesInBD)

        try {
            writeFile('./config/bd.json', JSON.stringify({bd: arrayInFile}, null, 4), err => {
                if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'bd.json'")
            })
            interaction.update({ content: `✅ ${message}`, embeds: [embedSuppr], components: [], flags: [MessageFlags.Ephemeral]})
            
        } catch (error) {
            interaction.reply({ content: "❌ Un erreur est survenu lors de l'écriture dans le fichier de configuration !\n" + error, flags: [MessageFlags.Ephemeral] })
        }
    }
}