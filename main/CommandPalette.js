const Help = require('../commands/Help')
const Patchnotes = require('../commands/Patchnotes')
const MusicPlayer = require('../commands/MusicPlayer')
const Info = require('../commands/Info')
const VoteHandler = require('../commands/VoteHandler')
const Year = require('../commands/Year')
const MessageGate = require('./MessageGate')
module.exports = function (msgGate, config) {
    const year = Year(config);
    const musicPlr = MusicPlayer(config);
    const help = Help(config);
    const patchnotes = Patchnotes(config);
    const info = Info(config);
    const voteHandler = VoteHandler(config);
    const pub = {};

    const initCommands = (commandObject) => {
        Object.keys(commandObject).forEach(commandKey => {
            let cmd = commandObject[commandKey];
            if (!cmd.internal) {
                cmd.usage.forEach(key => {
                    pub[key] = cmd;
                    pub[key + "help"] = cmd;
                })
            }
        })
    }

    initCommands(year);
    initCommands(musicPlr);
    initCommands(help);
    initCommands(patchnotes);
    initCommands(info);
    initCommands(voteHandler);
    initCommands(msgGate);

    return pub;
}