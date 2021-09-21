const patchnotes = require("../patchnotes.json")
//const { main_theme_color, permissions, name } = require('../config')
const { MessageEmbed } = require('discord.js');

module.exports = function ({ main_theme_color, permissions, name }) {
    let pub = {}

    pub.info = function (msgObj, message) {
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

    pub.infoHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "info";
        let description = "Kertoo tietoa botista";
        let args = "-"
        let allowedChannels = permissions.common.channels
        let allowedRanks = permissions.common.ranks
        let allowedUsers = permissions.common.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    return pub;

}