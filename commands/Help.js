//const { youtube_api_key, music_theme_color, main_theme_color, permissions, prefix, name, helpurl } = require('../config')
const { MessageEmbed } = require('discord.js');
const { getAllowedArray } = require('../helpers/helpers');

module.exports = function ({ youtube_api_key, permissions, main_theme_color, commands, prefix, name, helpurl }) {

    const getFromConfig = (key) => {
        if (commands[key]) {
            return commands[key]
        } else {
            throw "INFO.JS " + key + " COMMAND NOT DEFINED IN CONFIG"
        }

    }


    const helpCommand = (msgObj, command, funcs) => {
        let helpEmbed = new MessageEmbed();
        let channel = msgObj.channel;
        let keys = {}
        Object.keys(funcs).forEach(key => {
            if (key !== "help" && !key.includes("help")) {
                keys[funcs[key].key] = key
            }
        });
        keys = Object.values(keys)
        helpEmbed.setColor(main_theme_color)
            .setTitle(name + 'in komennot');
        let cmdStr = ""
        let descStr = ""
        if (helpurl !== "none") {
            helpEmbed.setThumbnail(helpurl);
        }

        for (let i = 0; i < keys.length; ++i) {
            let key = keys[i];
            let commandData = funcs[key];
            if (command[1]) {
                let allowedRanks = getAllowedArray(permissions, commandData, "ranks");
                if (allowedRanks.filter(rank => rank === command[1]).length === 0) {
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

    const help = {
        key: "help",
        minArgs: 0,
        maxArgs: 1,
        handlerFunction: helpCommand,
        ...getFromConfig("help")
    }

    const pub = {
        help
    }



    return pub;

}