const { readFileSync, writeFile } = require("fs");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const dayjs = require("dayjs");
const { URL, URLSearchParams } = require("url")

function generateID() {
    const uniqueString = uuidv4();
    const hash = crypto.createHash('sha256');
    hash.update(uniqueString + (Date.now() + Math.random() * Date.now().toFixed(3)));
    
    const uniqueHash = hash.digest('hex');
    return uniqueHash;
}

class Lan {
    /**
     * A LAN object representation
     * @param {String} name
     * @param {object} channels 
     * @param {object} config
     * @param {number} start
     */
    static #file = "./config/lans.json";
    constructor(name, channels, config, start = null, id = null, end = null) {
        this.id = id !== null ? id : generateID()
        this.name = name;
        this.channels = channels;
        this.config = config;
        // Get the timestamp in seconds
        this.startedAt = start !== null ? start : Math.floor(Date.now() / 1000);
        this.endedAt = end !== null ? end : null;
    }

    start() {
        this.startedAt = Math.floor(Date.now() / 1000)
    }
    
    end() {
        this.endedAt = Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60)

        let lanSaveFile = Lan.getFile()
        lanSaveFile = lanSaveFile.map(item => {
            if (item.name === this.name) {
                item.endedAt = this.endedAt;
            }
            return item;
        });

        writeFile(Lan.#file, JSON.stringify(lanSaveFile, null, 4), err => {
            if (err) throw new Error("/!\\ Error: Something wrong when writing in the 'lans.json'");
        });
    }

    /**
     * Save a Lan in a file
     */
    save() {
       try {
            let obj = {id: this.id, name: this.name, channels: this.channels, config: this.config, startedAt: this.startedAt, endedAt: this.endedAt}
            const lanSaveFile = Lan.getFile()
            lanSaveFile.push(obj);
            
            writeFile(Lan.#file, JSON.stringify(lanSaveFile, null, 4), err => {
                if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'lans.json'")
            })  
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Delete a Lan in a file
     */
    delete() {
        try {
            let lanSaveFile = Lan.getFile()
            lanSaveFile = lanSaveFile.filter(item => item.name !== this.name)
            writeFile(Lan.#file, JSON.stringify(lanSaveFile, null, 4), err => {
                if (err) throw new Error("/!\\ Error: Something wrong when we write in the 'lans.json'")
            })  
        } catch (error) {
            console.error(error)
        }
    }

    static getFile() {
        try {
            return JSON.parse(readFileSync(this.#file, "utf-8"));
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Return a lan
     * @param {string} name Lan name wanted to search
     * @returns {Lan} The specific Lan object or not
     */
    static getLanByName(name) {
        try {
            const file = this.getFile()
            let result = undefined;

            file.forEach(element => {
                if (element.name === name) {
                    result = this.fromJson(element)
                }
            });
            return result;
        } catch (error) {
            console.log(error)
        }
    }

    /**
     * Static method to create a Lan object from a JSON object
     * @param {object} jsonObject 
     * @returns {Lan}
     */
    static fromJson(jsonObject) {
        const id = jsonObject.id;
        const name = jsonObject.name;
        const channels = jsonObject.channels;
        const config = jsonObject.config;
        const startedAt = jsonObject.startedAt;
        const endedAt = jsonObject.endedAt;

        const lan = new Lan(name, channels, config, startedAt, id);
        lan.endedAt = endedAt;
        return lan;
    }

    getAgendaLink() {
        const getUrl = function(title, desc, locat, start, end) {
            const uri = new URL('https://www.google.com/calendar/render');
            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: title,
                details: desc,
                location: locat,
                dates: start + '/' + end
            });
            uri.search = params.toString();
            return uri.toString();
        };

        let description = `On se donne rendez-vous pour la ${this.name} !\n\nAdresse : ${this.config.adress}`
        return getUrl(this.name, description, this.config.adress, dayjs(this.startedAt * 1000).format('YYYYMMDDTHHmmss'), dayjs(this.endedAt * 1000).format('YYYYMMDDTHHmmss'))
    }
}

module.exports = { Lan, generateID }