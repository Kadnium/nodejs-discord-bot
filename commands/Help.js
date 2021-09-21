//const { youtube_api_key, music_theme_color, main_theme_color, permissions, prefix, name, helpurl } = require('../config')
const { MessageEmbed } = require('discord.js');

module.exports = function ({ youtube_api_key, music_theme_color, main_theme_color, permissions, prefix, name, helpurl }) {
    let pub = {}
    pub.help = function (msgObj, command, funcs) {
        let helpEmbed = new MessageEmbed();
        let channel = msgObj.channel;
        let keys = Object.keys(funcs);
        helpEmbed.setColor(main_theme_color)
            .setTitle(name + 'in komennot');
        let cmdStr = ""
        let descStr = ""
        if (helpurl !== "none") {
            helpEmbed.setThumbnail(helpurl);
        }

        for (let i = 0; i < keys.length; ++i) {
            let key = keys[i];
            let commandData = funcs[key]();
            if (command[1]) {
                if (commandData.allowedRanks.filter(rank => rank === command[1]).length === 0) {
                    continue;
                }
            }
            cmdStr += prefix + "" + commandData.usage + "\n";
            descStr += commandData.description + "\n";

        }
        if (cmdStr.length === 0) {
            cmdStr += "ei komentoja"
            descStr += "ei komentoja"
        }

        helpEmbed.addField('Komento', cmdStr, true)
            .addField('Kuvaus', descStr, true);
        channel.send(helpEmbed);

    }

    pub.helpHelp = function () {
        let minArgs = 0;
        let maxArgs = 1;
        let usage = "help";
        let description = "Listaa tiedot komennoista";
        let args = "[rankin nimi]"
        let allowedChannels = permissions.common.channels
        let allowedRanks = permissions.common.ranks
        let allowedUsers = permissions.common.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    return pub;

}