/**
 * @typedef {Object} FormatUrlOptions
 * @property {string} [country="France"] - Country to append if missing
 * @property {boolean} [forceCountry=false] - Always append country
 * @property {boolean} [isAddress=false] - If true, tries to format the query as a geographic address
 * @property {string} [locationQueryParamName="location"] - Query Param name to the location
 */

const DEFAULT_OPTIONS = {
    country: 'France',
    forceCountry: false,
    isAddress: false,
    locationQueryParamName: null,
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
        const key = config.locationQueryParamName;
        const currentVal = queryParams.location.toString()
        .split(" ")
        .map((word, index) =>
            index === 1
            ? word.charAt(0).toUpperCase() + word.slice(1)
            : word
        )
        .join(" ");

        const hasCountry = currentVal.toLowerCase().includes(config.country.toLowerCase());

        if (!hasCountry || config.forceCountry) {
            if (config.locationQueryParamName) {
                delete queryParams.location;
                queryParams[config.locationQueryParamName] = `${currentVal}, ${config.country}`;
            }

        }
    }

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
}

module.exports = { formatUrl }