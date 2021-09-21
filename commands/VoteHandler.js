//const { main_theme_color, permissions } = require('../config')
const { MessageEmbed } = require('discord.js');

module.exports = function ({ main_theme_color, permissions }) {
    let pub = {}
    let initialVote = {
        running: false,
        question: "",
        timeTotal: 0,
        startTime: 0,
        votedUsers: [],
        choices: [],
        voteObj: {}
    }
    let timerId = null;
    let currentVote = null;


    pub.vote = function (msgObj, command) {
        let channel = msgObj.channel;
        if (!isVoteRunning()) {
            channel.send("Ei äänestystä käynnissä!")
            return;
        }
        let user = msgObj.member.user;
        let userFull = user.username + "#" + user.discriminator;

        let votedUsers = currentVote.votedUsers;
        if (votedUsers.filter(u => u === userFull).length > 0) {
            channel.send("Olet jo äänestänyt!")
            return;
        }
        let number;
        try {
            number = parseInt(command[1]);
            if (isNaN(number) || number > currentVote.choices.length || number < 1) {
                throw SyntaxError;
            }
            number = number - 1;
        } catch (err) {
            channel.send("Viallinen luku sallitut 1-" + currentVote.choices.length)
            return;
        }
        let voteObj = currentVote.voteObj;
        voteObj[number] = voteObj[number] + 1

        votedUsers.push(userFull)
        channel.send("Äänestit vaihtoehtoa " + command[1])
    }
    //vote 1
    pub.voteHelp = function () {
        let minArgs = 1;
        let maxArgs = 1;
        let usage = "vote";
        let description = "Äänestä äänestyksessä";
        let args = "[luku]"
        let allowedChannels = permissions.common.vote.channels
        let allowedRanks = permissions.common.vote.ranks
        let allowedUsers = permissions.common.vote.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }
    isVoteRunning = function () {
        return currentVote ? currentVote.running : false;
    }

    pub.createVote = function (msgObj, command) {
        let channel = msgObj.channel;
        if (isVoteRunning()) {
            channel.send("Äänestys käynnissä, pysäytä ensin nykyinen!")
            return;
        }
        currentVote = JSON.parse(JSON.stringify(initialVote))
        command.shift()
        let commandStr = command.join(" ");
        currentVote.question = commandStr;
        channel.send("Äänestys '" + commandStr + "' luotu, lisää vaihtoehtoja vähintään 2")
    }

    pub.createVoteHelp = function () {
        let minArgs = 1;
        let maxArgs = 10;
        let usage = "createvote";
        let description = "Luo äänestys";
        let args = "[kysymys]"
        let allowedChannels = permissions.common.voteAdmin.channels
        let allowedRanks = permissions.common.voteAdmin.ranks
        let allowedUsers = permissions.common.voteAdmin.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    pub.voteOption = function (msgObj, command) {
        let channel = msgObj.channel;
        if (!currentVote) {
            channel.send("Luo äänestys ensin!")
            return;
        }
        command.shift()
        let commandStr = command.join(" ");
        currentVote.choices.push(commandStr);
        let curLen = currentVote.choices.length;
        currentVote.voteObj[curLen - 1] = 0
        channel.send("Vaihtoehto " + curLen + ": '" + commandStr + "' lisätty")
    }
    pub.voteOptionHelp = function () {
        let minArgs = 1;
        let maxArgs = 10;
        let usage = "voteoption";
        let description = "Lisää vaihtoehto";
        let args = "[vaihtoehto]"
        let allowedChannels = permissions.common.voteAdmin.channels
        let allowedRanks = permissions.common.voteAdmin.ranks
        let allowedUsers = permissions.common.voteAdmin.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    pub.startVote = function (msgObj, command) {
        let channel = msgObj.channel;
        if (!currentVote) {
            channel.send("Luo äänestys ensin!")
            return;
        }
        if (currentVote.choices.length < 2) {
            channel.send("Luo ainakin 2 vaihtoehtoa!")
            return
        }
        let number = 0;
        if (command[1]) {
            try {
                number = parseInt(command[1]);
                if (number > 600 || number < 10 || isNaN(number)) {
                    throw SyntaxError;
                }
                number = number * 1000;

            } catch (err) {
                channel.send("Viallinen aika, min 10 sec, max 600 sec")
                return;
            }
        }


        currentVote.running = true;
        printInfo(channel, false)
        if (number !== 0) {
            channel.send("Äänestys aloitettu, aikaa äänestää " + number / 1000 + " sec, !vote numero")
            currentVote.startTime = Date.now()
            currentVote.timeTotal = number;
            timerId = setTimeout(() => handleEnd(channel), number);
        } else {
            channel.send("Äänestys aloitettu, !vote numero")
        }


    }

    handleEnd = function (channel) {
        if (isVoteRunning()) {
            channel.send("Äänestys ohi")
            printInfo(channel, true);
            currentVote = null;
        } else if (currentVote) {
            channel.send("Äänestys poistettu")
            currentVote = null;
        }
        if (timerId) {
            clearTimeout(timerId);
            timerId = null;
        }

    }

    getWinner = function () {
        function getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        }
        let obj = currentVote.voteObj;
        let sortable = []
        for (let key in obj) {
            sortable.push([key, obj[key]])
        }
        sortable.sort((a, b) => b[1] - a[1]);
        let biggestNum = sortable[0][1]
        let randomArr = sortable.filter(item => item[1] === biggestNum);
        let returnElement = randomArr[getRandomInt(randomArr.length)]
        return returnElement[0][0];
    }
    printInfo = function (channel, handleEnding) {
        const choises = currentVote.choices
        let voteEmbed = new MessageEmbed()
            .setColor(main_theme_color)
            .setTitle(currentVote.question);
        for (let i = 0; i < choises.length; ++i) {
            let choise = choises[i];
            if (handleEnding) {
                voteEmbed.addField((i + 1) + ".", choise + ", ääniä " + currentVote.voteObj[i]);
            } else {
                voteEmbed.addField((i + 1) + ".", choise);
            }
        }
        let timeTotal = currentVote.timeTotal;
        if (timeTotal !== 0 && !handleEnding) {
            let elapsed = Date.now() - currentVote.startTime;
            let timeRemaining = timeTotal - elapsed;
            timeRemaining = parseInt(timeRemaining / 1000);
            voteEmbed.addField("Aikaa jäljellä: ", timeRemaining + " sec")
        }
        if (handleEnding) {
            let winnerIndex = getWinner();
            voteEmbed.addField("Voittaja: ", choises[winnerIndex])


        }

        channel.send(voteEmbed);
    }


    pub.startVoteHelp = function () {
        let minArgs = 0;
        let maxArgs = 1;
        let usage = "startvote";
        let description = "Aloita luotu äänestys";
        let args = "[kesto sekunteina]"
        let allowedChannels = permissions.common.voteAdmin.channels
        let allowedRanks = permissions.common.voteAdmin.ranks
        let allowedUsers = permissions.common.voteAdmin.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    pub.endVote = function (msgObj, command) {
        let channel = msgObj.channel;
        if (!currentVote) {
            channel.send("Luo äänestys ensin!")
            return;
        }
        handleEnd(channel);
    }
    //voteStatus,endVote,startVote,voteOption, createVote, vote

    pub.endVoteHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "endvote";
        let description = "Lopeta luotu äänestys";
        let args = "-"
        let allowedChannels = permissions.common.voteAdmin.channels
        let allowedRanks = permissions.common.voteAdmin.ranks
        let allowedUsers = permissions.common.voteAdmin.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }

    pub.voteStatus = function (msgObj, command) {
        let channel = msgObj.channel;
        if (!isVoteRunning()) {
            channel.send("Ei äänestystä")
            return
        }
        printInfo(channel, false)
    }
    pub.voteStatusHelp = function () {
        let minArgs = 0;
        let maxArgs = 0;
        let usage = "votestatus";
        let description = "Kertoo tietoa nykyisestä äänestyksestä";
        let args = "-"
        let allowedChannels = permissions.common.vote.channels
        let allowedRanks = permissions.common.vote.ranks
        let allowedUsers = permissions.common.vote.users
        return { minArgs, usage, description, args, maxArgs, allowedChannels, allowedRanks, allowedUsers }
    }



    return pub;

}

