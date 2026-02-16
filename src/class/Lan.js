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
     * @param {Array<string>}
     * @param {Date} start
     * @param {Date} end
     */
    static model = lanModel;
    constructor(name, channels, config, participants, id = null, start = null, end = null) {
        this.id = id;
        this.name = name;
        this.channels = channels;
        this.config = config;
        this.participants = participants;
        // Get the timestamp in seconds
        this.startedAt = start !== null ? start : this.start();
        this.endedAt = end;
    }

    start() {
        const [hour, minute] = this.config.hours.split('h').map(Number);
    
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        
        return Math.floor(date.getTime() / 1000);
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

        let description = `On se donne rendez-vous pour la ${this.name} !\n\nadresse : ${decrypt(this.config.address, process.env.TOKEN)}`;
        // end = default 3 days
        const estimatedDate = Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60);
        return getUrl(this.name, description, decrypt(this.config.address, process.env.TOKEN), dayjs(this.startedAt * 1000).format('YYYYMMDDTHHmmss'), dayjs(estimatedDate * 1000).format('YYYYMMDDTHHmmss'));
    }

    /**
     * Add a participant to a LAN
     * @param {string} discordId The discord ID of the participant of the current lan
     */
    async addParticipants(discordId) {
        this.participants.push(discordId);

        await Lan.model.findByIdAndUpdate(this.id, {
            participants: this.participants
        })
    }
}

module.exports = { Lan }