//const { main_theme_color, permissions } = require('../config')
const { MessageEmbed } = require('discord.js');

module.exports = function ({ main_theme_color, permissions }) {
    let pub = {}

    pub.year = async function (msgObj, command) {
        let user = msgObj.member.user;
        let author = msgObj.author;
        let id = user.id;
        let userName = user.username;
        let channel = msgObj.channel;
        let messageArray = []
        let lastStamp = ""
        let fetchArray = [""];
        let before = null;
        while (fetchArray.length !== 0) {
            fetchArray = await getMessages(channel, id, before);
            if (fetchArray.length !== 0) {
                messageArray = messageArray.concat(fetchArray);
                before = fetchArray[fetchArray.length - 1].id;
            }
        }
        let length = 0;
        const yearEmbed = new MessageEmbed()
            .setColor(main_theme_color)
            .setTitle("Käyttäjän " + userName + " vuosi");
        let messageContentStr = ""
        for (let i = messageArray.length - 1; i > 0; --i) {
            let msg = messageArray[i];
            if (msg.content.split(" ")[0].includes(".")) {
                length++;
                messageContentStr += msg.content + "\n"
                if (messageContentStr.length > 1700) {
                    //yearEmbed.addField("Päivät", messageContentStr)
                    author.send(messageContentStr);
                    messageContentStr = ""
                }
            }
            // console.log(msg.content.split(" ")[0].includes("."))


        }

        if (messageContentStr.length === 0) {
            messageContentStr = "-"
        }
        //yearEmbed.setDescription(messageContentStr)
        author.send(messageContentStr)
        author.send(length + " viestiä")


    }
    getMessages = async function (channel, id, before) {
        let queryObj = { limit: 100 }
        if (before) {
            queryObj.before = before;
        }
        let fetchedMessages = await channel.messages.fetch(queryObj).then(messages => {

            return messages.filter(m => m.author.id === id).array()
        })
        return fetchedMessages

    }
    pub.yearHelp = () => {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "vuosi";
        let description = "Listaa vuosikanavan viestit";
        let args = "-"
        let allowedChannels = permissions.common.year.channels;
        let allowedRanks = permissions.common.year.ranks;
        let allowedUsers = permissions.common.year.users;
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }

    }

    return pub
}