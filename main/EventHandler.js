const Discord = require('discord.js');
const MessageGate = require('./MessageGate')
const CommandPalette = require('./CommandPalette')

module.exports = function (config, client) {
    const messageGate = MessageGate(config);
    const commandPub = CommandPalette(messageGate, config);
    const { welcome_message, autorole } = config;

    /*
    Basic structure for commands is in commandPub object
    Play command as an example:
    Defined like
    pub.play = (msgObj,command) =>{
        musicPlr.handlePlay(msgObj, command);
    }
    Play is in other file and imported
    Every command needs also to have a help function
     pub.playhelp = () => {
            return musicPlr.playHelp();
        }
    So object has functions in object, command can be called commandPub["play"]()
    */

    const onGuildMemberAdd = (msgObj) => {
        let member = msgObj;
        if (autorole !== "none") {
            let role = member.guild.roles.cache.find(r => r.name === autorole);
            if (role != null) {
                member.roles.add(role).catch(console.error);
            }
        }
        if (welcome_message != null && welcome_message.length > 0) {
            member.guild.systemChannel.send(`${welcome_message} ${member.user}`)
        }
        console.log("Role added")
    }

    const onReady = () => {
        console.log(`Logged in as ${client.user.tag}!`);
    }
    const onMessage = (msg) => {
        if (msg.author.bot) return;
        // Every message goes through messagechecker,
        // For example checks for muted users
        let message = messageGate.checkMessage(msg)
        if (message) {
            // CommandPub has all commands in object
            if (commandPub[message[0]] != null) {
                if (message[0].includes("help")) {
                    // If user types help command, parse a help object
                    // From all help commands
                    if (message[0] === "help") {
                        let keys = Object.keys(commandPub);
                        let helpObj = {}
                        for (let i = 0; i < keys.length; ++i) {
                            let key = keys[i]
                            // Every command has help command, for example skiphelp, playhelp
                            // Put these in an object
                            if (key.includes("help") && key !== "help") {
                                helpObj[key] = commandPub[key];
                            }
                        }
                        handleCommand(message, msg, helpObj)
                    } else {
                        // Single help command, for example skiphelp was called
                        msg.channel.send(parseHelper(commandPub[message[0]]()))
                    }

                } else {
                    // For all the other commands
                    handleCommand(message, msg, null)


                }

            }

        }
    }


    /** 
    * Handles commands
    * @param message Message as an string array
    * @param msg Msg instance from discord
    * @param additionalArg null or help object, if null -> regular command, else-> help cmd
    */
    const handleCommand = function (message, msg, additionalArg) {
        if (messageGate.checkArgs(message.length - 1, commandPub[message[0] + "help"](), msg)) {
            if (additionalArg) {
                commandPub[message[0]](msg, message, additionalArg);
            } else {
                commandPub[message[0]](msg, message)
            }

        }
    }

    /** 
    * Single command's help info pattern
    * @param helpObj Commands pre defined help object
    * @return Help data to be sent
    */
    const parseHelper = function (helpObj) {
        const helpEmbed = new Discord.MessageEmbed()
            .setColor(config.main_theme_color)
            .addField('Komento:', config.prefix + "" + helpObj.usage)
            .addField('Kuvaus:', helpObj.description)
            .addField('Argumentit:', helpObj.args.length === 0 ? "-" : helpObj.args)
            .addField('Arg. määrä:', helpObj.minArgs === helpObj.maxArgs ? helpObj.minArgs : "min " + helpObj.minArgs + " max " + helpObj.maxArgs);

        return helpEmbed;
    }
    client.on("ready", onReady)
    client.on("guildMemberAdd", onGuildMemberAdd)
    client.on("message", onMessage)
    client.login(config.token)


}