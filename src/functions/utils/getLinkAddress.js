const querystring = require('querystring');

/**
 * Generates a Google Maps link for a given address.
 * @param {string} address - The address to generate a Google Maps link for.
 * @returns {string} - The Google Maps link for the address.
 */
function getGoogleMapsLink(address) {
    const baseUrl = 'https://www.google.com/maps/search/?api=1&query=';
    const encodedAddress = querystring.escape(address);
    return baseUrl + encodedAddress;
}

/**
 * Generates a Waze link for a given address.
 * @param {string} address - The address to generate a Waze link for.
 * @returns {string} - The Waze link for the address.
 */
function getWazeLink(address) {
    const baseUrl = 'https://waze.com/ul?q=';
    const encodedAddress = querystring.escape(address);
    return baseUrl + encodedAddress;
}

module.exports = { getGoogleMapsLink, getWazeLink }