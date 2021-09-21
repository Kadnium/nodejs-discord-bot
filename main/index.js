const Discord = require('discord.js');

const config = require("../config");

const EventHandler = require("./EventHandler")

const configArr = [config]
configArr.forEach(conf => {
    const client = new Discord.Client();
    EventHandler(conf, client)
})

