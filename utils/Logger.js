const couleur = require('chalk');
const dayjs = require("dayjs");

const formats = "{tStamp} {tag} {txt}\n"

function write(content, tagColor, bgTagColor, tag, error=false) {
    const timestemp = `[${dayjs().format('DD/MM - HH:mm:ss')}]`
    const logTag = `[${tag}]`
    const stream = error ? process.stderr : process.stdout;
    const item = formats
        .replace('{tStamp}', couleur.gray(timestemp))
        .replace('{tag}', couleur[bgTagColor][tagColor](logTag))
        .replace('{txt}', couleur.white(content));
    stream.write(item)
}

function error(content) {
    write(content, "black", "bgRed", "ERREUR", true);
}

function command(content) {
    write(content, "black", "bgGreen", "CMD", false);   
}

function warn(content) {
    write(content, 'black', "bgYellow", "WARN", false);
}

function event(content) {
    write(content, 'black', "bgWhite", 'EVT', false);
}

function clientStart(content) {
    write(content, 'black', "bgCyan", 'CLIENT', false);
}

function slashCommand(content) {
    write(content, 'black', "bgMagenta", 'SLASH COMMAND', false);
}

function typo(content) {
    write(content, "black", "bgBlue", "TYPO", false)
}

function test(content) {
    write(content, "white", "bgBlack", "TEST", false)
}
module.exports =  { error, warn, command, event, clientStart, slashCommand, typo, test };