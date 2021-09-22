//const { main_theme_color, permissions } = require('../config')
const { MessageEmbed } = require('discord.js');

module.exports = function ({ main_theme_color, commands }) {
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

    const getFromConfig = (key) => {
        if (commands[key]) {
            return commands[key]
        } else {
            throw "VOTEHANDLER.JS " + key + " COMMAND NOT DEFINED IN CONFIG"
        }

    }




    const voteCommand = (msgObj, command) => {
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



    const isVoteRunning = function () {
        return currentVote ? currentVote.running : false;
    }

    const createVoteCommand = (msgObj, command) => {
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


    const voteOptionCommand = (msgObj, command) => {
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



    const startVoteCommand = (msgObj, command) => {
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

    const handleEnd = function (channel) {
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

    const getWinner = function () {
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
    const printInfo = function (channel, handleEnding) {
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


    const endVoteCommand = (msgObj, command) => {
        let channel = msgObj.channel;
        if (!currentVote) {
            channel.send("Luo äänestys ensin!")
            return;
        }
        handleEnd(channel);
    }



    const voteStatusCommand = (msgObj, command) => {
        let channel = msgObj.channel;
        if (!isVoteRunning()) {
            channel.send("Ei äänestystä")
            return
        }
        printInfo(channel, false)
    }

    const vote = {
        key: "vote",
        minArgs: 1,
        maxArgs: 1,
        handlerFunction: voteCommand,
        ...getFromConfig("vote")
    }

    const votestatus = {
        key: "votestatus",
        minArgs: 0,
        maxArgs: 0,
        handlerFunction: voteStatusCommand,
        ...getFromConfig("votestatus")
    }

    const createvote = {
        key: "createvote",
        minArgs: 1,
        maxArgs: 10,
        handlerFunction: createVoteCommand,
        ...getFromConfig("createvote")
    }

    const voteoption = {
        key: "voteoption",
        minArgs: 1,
        maxArgs: 10,
        args: "[vaihtoehto]",
        handlerFunction: voteOptionCommand,
        ...getFromConfig("voteoption")
    }

    const startvote = {
        key: "startvote",
        minArgs: 0,
        maxArgs: 1,
        handlerFunction: startVoteCommand,
        ...getFromConfig("startvote")
    }



    const endvote = {
        key: "endvote",
        minArgs: 0,
        maxArgs: 0,
        handlerFunction: endVoteCommand,
        ...getFromConfig("endvote")
    }

    const pub = {
        vote,
        votestatus,
        createvote,
        voteoption,
        startvote,
        endvote,
    }




    return pub;

}

