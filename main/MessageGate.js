//const { prefix, permissions } = require('../config')
module.exports = function ({ prefix, permissions }) {
    let pub = {}

    let optionObj = {
        gifs: true,
        images: true,
        mutedUsers: {}
    }
    /** 
    * Disable and enable gifs
    * @param msgObj Message instance from discord
    * @param args command as an string arr
    */
    pub.handleGifs = function (msgObj, command) {
        optionObj.gifs = !optionObj.gifs;
        let infoStr = optionObj.gifs ? "enabloitu" : "disabloitu";
        msgObj.channel.send("Giffit " + infoStr)
    }
    pub.handleGifsHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "gifs";
        let description = "Enabloi/disabloi giffit";
        let args = "-"
        let allowedChannels = permissions.messageGate.media.channels
        let allowedRanks = permissions.messageGate.media.ranks
        let allowedUsers = permissions.messageGate.media.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }

    }
    /** 
     * Disable and enable images
    * @param msgObj Message instance from discord
    * @param args command as an string arr
    */
    pub.handleImages = function (msgObj, command) {
        optionObj.images = !optionObj.images;
        let infoStr = optionObj.images ? "enabloitu" : "disabloitu";
        msgObj.channel.send("Kuvat " + infoStr)
    }

    pub.handleImagesHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "images";
        let description = "Enabloi/disabloi kuvat";
        let args = "-"
        let allowedChannels = permissions.messageGate.media.channels
        let allowedRanks = permissions.messageGate.media.ranks
        let allowedUsers = permissions.messageGate.media.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }

    }
    pub.mute = function (msgObj, command) {
        msgObj.channel.send("Ei vielä toiminnassa")
    }
    pub.muteHelp = function () {
        let minArgs = 1;
        let maxArgs = 1;
        let usage = "mute";
        let description = "Muteta käyttäjä";
        let args = "[käyttäjä]"
        let allowedChannels = permissions.messageGate.mute.channels
        let allowedRanks = permissions.messageGate.mute.ranks
        let allowedUsers = permissions.messageGate.mute.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }

    }
    pub.unmute = function (msgObj, command) {
        msgObj.channel.send("Ei vielä toiminnassa")
    }

    pub.unmuteHelp = function () {
        let minArgs = 1;
        let maxArgs = 1;
        let usage = "unmute";
        let description = "Unmuteta käyttäjä";
        let args = "[käyttäjä]"
        let allowedChannels = permissions.messageGate.mute.channels
        let allowedRanks = permissions.messageGate.mute.ranks
        let allowedUsers = permissions.messageGate.mute.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    /** 
   * @param msg Message as a string
   * @return null or message as an array without prefix
   */
    const checkPrefix = function (msg) {
        let returnVal = null;
        if (msg[0] === prefix) {
            returnVal = msg.substring(1, msg.length).split(" ");

        }
        return returnVal;
    }

    const deleteMessage = function (message, infoText) {
        let channel = message.channel;
        message.delete()
            // .then(msg => channel.send(infoText))
            .catch(console.error);
    }
    /** 
    * @param url attachment array
    * @param args Blacklisted words 
    * @return boolean if attachment allowed
    */
    const checkAttachments = function (attachments, args) {
        for (let i = 0; i < attachments.length; ++i) {
            let url = attachments[i].url;
            if (!checkMsgUrl(url, args)) {
                return false;
            }
        }

        return true;
    }
    /** 
    * @param url Checked url
    * @param args Blacklisted words in url
    * @return boolean if url allowed
    */
    const checkMsgUrl = function (url, args) {
        if (args.some(str => url.includes(str))) {
            return false
        }
        return true;
    }

    /** 
    * @param msgObj Message instance from discord
    * @return null or used command as an array of strings
    */
    pub.checkMessage = function (msgObj) {
        const { gifs, images } = optionObj;
        let attachments = msgObj.attachments.array()
        let content = msgObj.content;
        if (!gifs) {
            if (attachments.length > 0) {
                if (!checkAttachments(attachments, ["gif"])) {
                    deleteMessage(msgObj, "Giffit ei ole sallittuja!")
                    return null;
                }
            } else {
                if (!checkMsgUrl(content, ["gif", "tenor"]) && content.includes("http")) {
                    deleteMessage(msgObj, "Giffit ei ole sallittuja!")
                    return null;
                }
            }
        }
        if (!images) {
            if (attachments.length > 0) {
                if (!checkAttachments(attachments, ["png", "jpeg"])) {
                    deleteMessage(msgObj, "Kuvat ei ole sallittuja")
                    return null;

                }
            } else {
                if (!checkMsgUrl(content, ["png", "jpeg", "tenor", "imgur"]) && content.includes("http")) {
                    deleteMessage(msgObj, "Kuvat ei ole sallittuja!")
                    return null;
                }

            }
        }

        return checkPrefix(msgObj.content)
    }



    // let minArgs = 1;
    // let maxArgs = 10;
    // let usage = "play";
    // let description = "Toista musiikkia";
    // let args = "[kappaleen nimi / url]"
    // allowedChannels = permissions.music.channels
    // allowedRanks = permissions.music.ranks

    /** 
   * Checks if user has proper role to use the command
   * @param msgOjb Message instance from discord
   * @param helpObj Help object of a single command
   * @return Boolean value if role is allowed
   */
    const checkPermissions = function (msgObj, helpObj) {
        let allowedRanks = helpObj.allowedRanks;
        let userRanks = msgObj.member.roles.cache.array();
        if (allowedRanks.length > 0) {
            let filteredRoles = userRanks.filter(role => {
                return allowedRanks.find(ar => ar.toLowerCase() === role.name.toLowerCase())
            })
            return filteredRoles.length !== 0;
        }
        return true;
    }
    /** 
   * Checks if command can be used on channel
   * @param msgOjb Message instance from discord
   * @param helpObj Help object of a single command
   * @return Boolean value if channel is allowed
   */
    const checkChannel = function (msgObj, helpObj) {
        let channel = msgObj.channel;
        let allowedChannels = helpObj.allowedChannels;

        if (allowedChannels.length > 0) {
            let filteredChannels = allowedChannels.filter(ch => ch.toLowerCase() === channel.name.toLowerCase());
            return filteredChannels.length !== 0;
        }
        return true;
    }

    /** 
   * Checks if user is valid to use the command
   * @param msgOjb Message instance from discord
   * @param helpObj Help object of a single command
   * @return Boolean value if user is allowed
   */
    const checkUser = function (msgObj, helpObj) {
        let allowedUsers = helpObj.allowedUsers;
        let user = msgObj.member.user;

        let userFull = user.username + "#" + user.discriminator;
        if (allowedUsers.length > 0) {
            let filteredUsers = allowedUsers.filter(role => role === userFull);
            return filteredUsers.length !== 0;
        }
        return true;
    }

    /** 
    * Checks if command will be processed 
    * @param msgLength Length of the message array
    * @param helpObj Help object of a single command
    * @param msgObj Message instance from discord
    * @return Boolean value if message is allowed to be processed
    */
    pub.checkArgs = function (msgLength, helpObj, msgObj) {
        let channel = msgObj.channel;
        let allowedUsersLen = helpObj.allowedUsers.length;
        let rolePerm = checkPermissions(msgObj, helpObj)
        let userPerm = checkUser(msgObj, helpObj);
        if (allowedUsersLen === 0) {
            if (!rolePerm) {
                channel.send("Ei oikeuksia tähän komentoon");
                return false
            }
        } else {
            if (!userPerm && !rolePerm) {
                channel.send("Ei oikeuksia tähän komentoon");
                return false
            }
        }



        if (!checkChannel(msgObj, helpObj)) {
            channel.send("Väärä kanava! Sallittu kanava " + helpObj.allowedChannels.join(", "));
            return false;
        }
        if (msgLength >= helpObj.minArgs && msgLength <= helpObj.maxArgs) {
            return true;

        } else {
            channel.send("Väärä määrä argumentteja, max " + helpObj.maxArgs + " min " + helpObj.minArgs);
            return false;

        }
    }



    return pub;

}