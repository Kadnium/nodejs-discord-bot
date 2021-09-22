const patchnotes = require("../patchnotes.json")
//const { main_theme_color, permissions, name } = require('../config')
const { MessageEmbed } = require('discord.js');

module.exports = function ({ main_theme_color, commands, name }) {

    const getFromConfig = (key) => {
        if (commands[key]) {
            return commands[key]
        } else {
            throw "INFO.JS " + key + " COMMAND NOT DEFINED IN CONFIG"
        }

    }


    const infoCommand = (msgObj, message) => {
        let info = patchnotes.info;
        let verHist = patchnotes.versionHistory;
        let currentVer = verHist[verHist.length - 1].version;
        let channel = msgObj.channel;

        let patchEmbed = new MessageEmbed()
            .setColor(main_theme_color)
            .setTitle("Tietoa " + name + "ista")
            .addField("Versio", currentVer)
            .addField("Tekijä", info.madeby)
            .addField("Ohjelmointi", info.language)
            .addField("Hostaus", info.hosted);

        channel.send(patchEmbed);
    }


    const info = {
        key: "info",
        minArgs: 0,
        maxArgs: 0,
        handlerFunction: infoCommand,
        ...getFromConfig("info")
    }

    const pub = {
        info
    }

    return pub;


}