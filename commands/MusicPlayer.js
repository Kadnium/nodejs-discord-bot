const ytdl = require('ytdl-core');
//const { youtube_api_key, music_theme_color, permissions } = require('../config')
//const { MessageEmbed } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const radioChannels = require('../radio');
const YoutubeScraper = require('../main/YoutubeScraper');


module.exports = function ({ youtube_api_key, music_theme_color, permissions }) {
    const YoutubeAPI = YoutubeScraper();
    let pub = {}
    const queue = new Map();

    checkVoiceChannel = function (msgObj) {
        if (!msgObj.member.voice.channel) {
            msgObj.channel.send("Et ole puhekanavalla!")
            return false;
        }
        return true;
    }
    pub.handlePlay = async function (msgObj, command) {
        command.shift()
        if (!checkVoiceChannel(msgObj)) {
            return;
        }
        let commandStr = command.join(" ");
        let songArr = [];
        if (commandStr.startsWith("http") && commandStr.includes(".") && !commandStr.includes("list")) {
            //let songInfo = await ytdl.getInfo(commandStr)
            let videoId = commandStr.split("=");
            if (videoId.length > 1) {
                videoId = videoId[1]
            } else {
                msgObj.channel.send("Viallinen linkki!")
                return;
            }
            songArr = await YoutubeAPI.findVideo(videoId);
        } else if (commandStr.startsWith("http") && commandStr.includes("list")) {
            songArr = await handlePlayList(msgObj, commandStr)
        } else {
            songArr = await handleKeyWord(msgObj, commandStr)
        }
        if (songArr.length === 0) {
            return;
        }

        let guildId = msgObj.guild.id;
        let channel = msgObj.channel;

        let voiceChannel = msgObj.member.voice.channel;
        let serverQueue = queue.get(guildId);

        if (!serverQueue) {
            const queueObj = {
                textChannel: channel,
                voiceChannel: voiceChannel,
                connection: null,
                songs: [],
                volume: 5,
                playing: true,
                dispatcher: null,
                repeat: false
            }

            queue.set(guildId, queueObj);
            queueObj.songs = queueObj.songs.concat(songArr);
            try {
                let connection = await voiceChannel.join();
                queueObj.connection = connection;
                play(msgObj.guild.id, queueObj.songs[0], msgObj);

                setTimeout(() => checkVoiceChannelActivity(msgObj), 30000);


            } catch (err) {
                console.log(err);
                queue.delete(guildId);
                return channel.send(err);
            }
        } else {
            serverQueue.songs = serverQueue.songs.concat(songArr)

        }
        if (songArr.length > 1) {
            channel.send(`${songArr.length} kappaletta lisätty soittolistalle!`);
        } else {
            channel.send(`${songArr[0].title} lisätty soittolistalle!`);
            //console.log(serverQueue.songs);
            let serverQueueTemp = queue.get(guildId);
            channel.send(createInfoThumbnail(serverQueueTemp.songs[0], guildId, false))
        }



    }

    pub.playHelp = function () {
        let minArgs = 1;
        let maxArgs = 10;
        let usage = "play";
        let description = "Toista musiikkia";
        let args = "[kappaleen nimi / url]"
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }
    pub.radio = async function (msgObj, message) {
        let url = radioChannels[message[1]]
        let channel = msgObj.channel;
        if (!checkVoiceChannel(msgObj)) {
            return;
        }
        if (url) {
            let song = {
                url: url,
                title: message[1],
                thumbnail: "http://pngimages.net/sites/default/files/radio-png-image-29813.png",
                duration: "stream",
                radio: true
            }
            let guildId = msgObj.guild.id;

            let voiceChannel = msgObj.member.voice.channel;
            let serverQueue = queue.get(guildId);

            if (!serverQueue) {
                const queueObj = {
                    textChannel: channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 5,
                    playing: true,
                    dispatcher: null,
                    repeat: false
                }

                queue.set(guildId, queueObj);
                queueObj.songs.push(song);
                try {
                    let connection = await voiceChannel.join();
                    queueObj.connection = connection;
                    play(msgObj.guild.id, queueObj.songs[0], msgObj);

                    setTimeout(() => checkVoiceChannelActivity(msgObj), 30000);


                } catch (err) {
                    console.log(err);
                    queue.delete(guildId);
                    return channel.send(err);
                }
            } else {
                serverQueue.songs.push(song)

            }
            channel.send(`${song.title} lisätty soittolistalle!`);

        } else {
            channel.send("Kanavaa ei löytynyt")
        }
    }
    pub.radioHelp = function (msgObj, message) {
        let minArgs = 1;
        let maxArgs = 1;
        let usage = "radio";
        let description = "Soita radiokanavaa";
        let args = "[radiokanava]"
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    pub.radiochannels = function (msgObj, message) {
        let channel = msgObj.channel;
        const radioEmbed = new MessageEmbed()
            .setColor(music_theme_color)
            .setTitle("Radiokanavat: ");
        let chStr = ""
        for (let channel in radioChannels) {
            chStr += channel + "\n"
        }
        radioEmbed.addField("Kanavat", chStr);
        channel.send(radioEmbed)
    }
    // pub.addChannel = function (msgObj, message) {
    //     radioChannels = require("../radio");
    //     msgObj.channel.send("Radiokanavat uudelleenladattu")
    // }
    // pub.reloadChannelsHelp = function () {
    //     let minArgs = 0;
    //     let maxArgs = 0;
    //     let usage = "radiokanavat";
    //     let description = "Listaa radiokanavat";
    //     let args = "-"
    //     let allowedChannels = permissions.music.channels
    //     let allowedRanks = permissions.music.ranks
    //     let allowedUsers = permissions.music.users
    //     return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    // }
    pub.radiochannelsHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "radiokanavat";
        let description = "Listaa radiokanavat";
        let args = "-"
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }



    let checkVoiceChannelActivity = function (msgObj) {
        let guildId = msgObj.guild.id;
        let channel = msgObj.channel;
        let serverQueue = queue.get(guildId);
        if (serverQueue) {
            if (serverQueue.voiceChannel.members.array().length === 1) {
                serverQueue.songs = [];
                serverQueue.voiceChannel.leave();
                queue.delete(guildId);
                channel.send("Ei käyttäjiä kanavalla, poistun")
            } else {
                setTimeout(() => checkVoiceChannelActivity(msgObj), 30000);
            }
        }


    }
    let createInfoThumbnail = function (song, guildId, showDuration) {
        let serverQueue = queue.get(guildId);
        let currentTime = serverQueue.dispatcher ? serverQueue.dispatcher.time / 1000 : null;
        const videoEmbed = new MessageEmbed()
            .setThumbnail(song.thumbnail) // song thumbnail
            .setColor(music_theme_color)
            .addField('Nyt soi:', song.title)
            .addField('Kesto:', song.duration);
        if (currentTime && showDuration) {
            videoEmbed.addField('Soinut:', parseInt(currentTime / 60) + " min " + parseInt(currentTime % 60) + " s")
        }

        return videoEmbed;
    }


    let handleKeyWord = async function (msgObj, command) {
        try {
            let channel = msgObj.channel;
            const videos = await YoutubeAPI.findResults(command)
            if (videos.length < 2) {
                channel.send("Ei tarpeeksi hakutuloksia")
                return [];
            }
            const vidNameArr = [];

            for (let i = 0; i < videos.length; i++) {
                vidNameArr.push(`${i + 1}: ${videos[i].title}`);
            }

            const embed = new MessageEmbed()
                .setColor(music_theme_color)
                .setTitle('Kirjoita numero välillä 1-' + videos.length);
            for (let i = 0; i < videos.length; ++i) {
                embed.addField("Video " + (i + 1), vidNameArr[i]);
            }
            embed.addField('Poistu kirjoittamalla', 'Poistu');
            var songEmbed = await channel.send({ embed });
            try {
                var response = await channel.awaitMessages(
                    msg => (msg.content > 0 && msg.content <= videos.length) || msg.content === 'Poistu',
                    {
                        max: 1,
                        maxProcessed: 1,
                        time: 60000,
                        errors: ['time']
                    }
                );
                let content = response.first().content;
                if (content === "Poistu") {
                    songEmbed.delete();
                    return [];
                } else {
                    var videoIndex = parseInt(content);
                }

            } catch (err) {
                console.error(err);

                channel.send(
                    'Yritä uudelleen ja kirjoita numero välillä 1-' + videos.length
                );
                return [];
            }
            let song;
            try {
                // get video data from the API
                song = videos[videoIndex - 1]

            } catch (err) {
                console.error(err);
                songEmbed.delete();
                channel.send(
                    'Virhe videon latauksessa'
                );
                return []
            }

            let returnSongArr = []
            returnSongArr.push(song);

            return returnSongArr;




        } catch (err) {
            console.error(err);
            msgObj.channel.send("Virhe videoiden lataamisessa")
            return [];
        }
    }

    let handlePlayList = async function (msgObj, command) {
        try {
            let playlistArr = command.split("list=");
            let playlistId = ""
            if (playlistArr.length > 1) {
                playlistId = playlistArr[1];
            } else {
                throw "Viallinen id"
            }
            const videosArr = await YoutubeAPI.findPlaylist(playlistId)
            return videosArr
        } catch (err) {
            console.error(err);
            msgObj.channel.send("Virhe soittolistan lataamisessa")
            return [];
        }
    }

    pub.np = function (msgObj, command) {
        let guildId = msgObj.guild.id;
        let serverQueue = queue.get(guildId);
        if (serverQueue) {
            if (serverQueue.songs.length > 0) {
                msgObj.channel.send(createInfoThumbnail(serverQueue.songs[0], guildId, true));
                return;
            }
        }
        msgObj.channel.send("Ei kappaleita")
    }

    pub.npHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "np";
        let description = "Näytä tämänhetken kappale";
        let args = ""
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    pub.playlist = function (msgObj, command) {
        const serverQueue = queue.get(msgObj.guild.id);
        // let returnStr = "Ei kappaleita soittolistalla"
        const embed = new MessageEmbed()
            .setColor(music_theme_color)
            .setTitle('Soittolista');
        if (serverQueue) {
            let songs = serverQueue.songs;
            if (songs.length > 0) {
                returnStr = "";
                let embedStr = "";
                for (let i = 0; i < songs.length; ++i) {
                    let song = songs[i]
                    let repeatStr = serverQueue.repeat && i === 0 ? "(repeat)" : ""
                    embedStr += (i + 1) + ". " + song.title + ", kesto: " + song.duration + " " + repeatStr + "\n"
                    if (embedStr.length > 900) {
                        break;
                    }
                }
                embed.addField("#", embedStr)
            }
        }
        msgObj.channel.send(embed);
    }

    pub.playlistHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "playlist";
        let description = "Listaa kappaleet";
        let args = ""
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }



    pub.skip = function (msgObj, command) {
        if (!checkVoiceChannel(msgObj)) {
            return;
        }
        let id = msgObj.guild.id;
        let serverQueue = queue.get(id);
        if (!serverQueue) return msgObj.channel.send("Ei skipattavaa");
        if (serverQueue.songs.length === 0) return msgObj.channel.send("Ei skipattavaa");
        if (serverQueue.connection.dispatcher == null) {
            serverQueue.voiceChannel.leave();
            queue.delete(id);
            return;
        }
        serverQueue.connection.dispatcher.end();
        msgObj.channel.send(`${serverQueue.songs[0].title} skipattu!`);



    }
    pub.skipHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "skip";
        let description = "Skippaa kappale";
        let args = ""
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedUsers, allowedRanks }
    }

    pub.clear = function (msgObj, command) {
        if (!checkVoiceChannel(msgObj)) {
            return;
        }

        const serverQueue = queue.get(msgObj.guild.id);
        if (serverQueue.songs.length > 0) {
            serverQueue.songs.length = 1;
            msgObj.channel.send("Soittolista tyhjennetty")
        } else {
            msgObj.channel.send("Ei tyhjennettävää")
        }

    }
    pub.clearHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "clear";
        let description = "Tyhjennä soittolista";
        let args = ""
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }
    pub.repeat = function (msgObj, command) {
        let serverQueue = queue.get(msgObj.guild.id);
        let channel = msgObj.channel;
        if (serverQueue) {
            serverQueue.repeat = !serverQueue.repeat
            if (serverQueue.repeat) {
                channel.send("Repeat päällä")
            } else {
                channel.send("Repeat pois")
            }
        }

    }
    pub.repeatHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "repeat";
        let description = "Toista tämänhetkistä kappaletta repeatilla";
        let args = ""
        let allowedChannels = permissions.music.channels
        let allowedRanks = permissions.music.ranks
        let allowedUsers = permissions.music.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    pub.volume = function (msgObj, command) {
        if (!checkVoiceChannel(msgObj)) {
            return;
        }
        let serverQueue = queue.get(msgObj.guild.id);
        command.shift()
        let volume = command[0]
        if (serverQueue) {
            if (volume >= 0 && volume <= 1000) {
                serverQueue.volume = command[0]
                serverQueue.dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
            } else {
                msgObj.channel.send("Valitse luku väliltä 0-1000")
            }
        } else {
            msgObj.channel.send("Ei musiikkia")
        }

    }
    pub.volumeHelp = function () {
        let minArgs = 1;
        let maxArgs = 1;
        let usage = "volume";
        let description = "Muuta musiikin voimakkuutta";
        let args = "[luku 0-1000]"
        let allowedChannels = permissions.music.volume.channels;
        let allowedRanks = permissions.music.volume.ranks;
        let allowedUsers = permissions.music.volume.users;
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }


    let play = async function (guild, song, msgObj) {
        let serverQueue = queue.get(guild);
        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild);
            return;
        }
        //let stream = ytdl.downloadFromInfo(info, {filter: 'audioonly'})

        // let dispatcher = await connection.playStream(stream);

        let stream;
        if (song.radio) {
            stream = song.url;
        } else {
            stream = ytdl(song.url)
        }
        let dispatcher = await serverQueue.connection.play(stream)
            .on('finish', () => {
                if (!serverQueue.repeat) {
                    serverQueue.songs.shift();
                }
                let song = serverQueue.songs[0]
                if (song) {
                    msgObj.channel.send(createInfoThumbnail(song, guild, false))
                }
                play(guild, song, msgObj);

            })
            .on('error', error => {
                msgObj.channel.send("Virhe kappaleen aloittamisessa");
                console.error(error);
            });

        //console.log(dispatcher);
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        serverQueue.dispatcher = dispatcher;
    }


    return pub;
}


