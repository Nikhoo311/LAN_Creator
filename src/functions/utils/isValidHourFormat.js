module.exports = function isValidHourFormat(hours) {
    const match = hours.match(/^(\d{1,2})h(\d{2})$/);
    if (!match) return false;

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}