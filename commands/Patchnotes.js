const patchnotes = require("../patchnotes.json")
//const { main_theme_color, permissions } = require('../config')
const { MessageEmbed } = require('discord.js');

module.exports = function ({ main_theme_color, permissions }) {
    let pub = {}
    pub.patchnotes = function (msgObj, message) {
        let version = patchnotes.versionHistory;
        let channel = msgObj.channel;
        function generateEmbedField(vers, embed) {
            let versionString = "Versio: " + vers.version + "\n"
                + "Ominaisuudet: " + vers.features + "\n"
                + "Korjaukset: " + vers.fixes;
            embed.addField("#", versionString);

        }
        let patchEmbed = new MessageEmbed()
            .setColor(main_theme_color)
            .setTitle('Patchnotes');
        // list only versions, else list a inputted version
        if (message.length === 1) {
            //"version": "0.1",
            //"features": "Lisätty musiikkisoitin sekä help",
            //"fixes": "-"
            for (let i = 0; i < version.length; ++i) {
                let vers = version[i];
                generateEmbedField(vers, patchEmbed);
            }
        } else {
            let searchVer = version.filter(ver => ver.version === message[1])
            if (searchVer.length === 0) {
                channel.send("Ei löytynyt versiota " + message[1])
                return;
            }
            generateEmbedField(searchVer[0], patchEmbed);


        }
        channel.send(patchEmbed);

    }

    pub.patchnotesHelp = function () {
        let minArgs = 0;
        let maxArgs = 1;
        let usage = "patchnotes";
        let description = "Listaa botin version muutokset";
        let args = "[versio]"
        let allowedChannels = permissions.common.channels
        let allowedRanks = permissions.common.ranks
        let allowedUsers = permissions.common.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    return pub;
}