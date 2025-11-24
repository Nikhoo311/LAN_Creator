const dayjs = require("dayjs");
const { URL, URLSearchParams } = require("url");
const { decrypt } = require("../functions/utils/crypt");
const lanModel = require("../schemas/lan");

class Lan {
    /**
     * A LAN object representation
     * @param {String} name
     * @param {Array<object>} channels 
     * @param {object} config
     * @param {number} start
     */
    static model = lanModel;
    constructor(name, channels, config, start = null, end = null, id = null) {
        this.id = id;
        this.name = name;
        this.channels = channels;
        this.config = config;
        // Get the timestamp in seconds
        this.startedAt = start !== null ? start : Math.floor(Date.now() / 1000);
        this.endedAt = end;
    }

    start() {
        this.startedAt = Math.floor(Date.now() / 1000)
    }

    end(addDays = 0) {
        this.endedAt = Math.floor(Date.now() / 1000) + (addDays * 24 * 60 * 60) 
    }

    static getLanByName() { return }

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

        let description = `On se donne rendez-vous pour la ${this.name} !\n\naddresse : ${decrypt(this.config.address, process.env.TOKEN)}`
        return getUrl(this.name, description, decrypt(this.config.address, process.env.TOKEN), dayjs(this.startedAt * 1000).format('YYYYMMDDTHHmmss'), dayjs(this.endedAt * 1000).format('YYYYMMDDTHHmmss'))
    }
}

module.exports = { Lan }