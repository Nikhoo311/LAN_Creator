/**
 * @typedef {Object} FormatUrlOptions
 * @property {string} [country="France"] - Country to append if missing
 * @property {boolean} [forceCountry=false] - Always append country
 * @property {boolean} [isAddress=false] - If true, tries to format the query as a geographic address
 */

const DEFAULT_OPTIONS = {
    country: 'France',
    forceCountry: false,
    isAddress: false
};

/**
 * Robustly formats a URL by managing query parameters and business logic.
 * * @param {string} baseUrl - The base URL
 * @param {Object} queryParams - Key/value pairs (e.g., { q: 'Paris' } or { query: 'Paris' })
 * @param {FormatUrlOptions} [options={}] - Additional options
 * @returns {string}
 */
function formatUrl(baseUrl, queryParams, options = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };
    const url = new URL(baseUrl);

    if (config.isAddress) {
        const currentVal = queryParams.location.toString();
        const hasCountry = currentVal.toLowerCase().includes(config.country.toLowerCase());

        if (!hasCountry || config.forceCountry) {
            queryParams.location = `${currentVal}, ${config.country}`;
        }
    }

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, value);
        }
    });

    console.log(url);
    console.log(queryParams)
    

    return url.toString();
}

module.exports = { formatUrl }