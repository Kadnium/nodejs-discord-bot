const Help = require('../commands/Help')
const Patchnotes = require('../commands/Patchnotes')
const MusicPlayer = require('../commands/MusicPlayer')
const Info = require('../commands/Info')
const VoteHandler = require('../commands/VoteHandler')
const Year = require('../commands/Year')

module.exports = function (msgGate, config) {
    const year = Year(config);
    const musicPlr = MusicPlayer(config);
    const help = Help(config);
    const patchnotes = Patchnotes(config);
    const info = Info(config);
    const voteHandler = VoteHandler(config);

    let pub = {};
    pub.help = (msgObj, command, funcs) => {
        help.help(msgObj, command, funcs)
    }
    pub.patchnotes = (msgObj, command) => {
        patchnotes.patchnotes(msgObj, command);
    }
    pub.info = (msgObj, command) => {
        info.info(msgObj, command);
    }
    pub.vuosi = (msgObj, command) => {
        year.year(msgObj, command);
    }

    pub.gifs = (msgObj, command) => {
        msgGate.handleGifs(msgObj, command)
    }
    pub.images = (msgObj, command) => {
        msgGate.handleImages(msgObj, command)
    }
    pub.mute = (msgObj, command) => {
        msgGate.mute(msgObj, command)
    }
    pub.unmute = (msgObj, command) => {
        msgGate.unmute(msgObj, command)
    }

    // vote commands
    //voteStatus,endVote,startVote,voteOption, createVote, vote
    pub.vote = (msgObj, command) => {
        voteHandler.vote(msgObj, command);
    }
    pub.votestatus = (msgObj, command) => {
        voteHandler.voteStatus(msgObj, command);
    }
    pub.endvote = (msgObj, command) => {
        voteHandler.endVote(msgObj, command);
    }
    pub.startvote = (msgObj, command) => {
        voteHandler.startVote(msgObj, command);
    }
    pub.voteoption = (msgObj, command) => {
        voteHandler.voteOption(msgObj, command);
    }
    pub.createvote = (msgObj, command) => {
        voteHandler.createVote(msgObj, command);
    }


    // music commands
    pub.play = (msgObj, command) => {
        musicPlr.handlePlay(msgObj, command);
    }
    pub.playlist = (msgObj, command) => {
        musicPlr.playlist(msgObj, command);
    }
    pub.skip = (msgObj, command) => {
        musicPlr.skip(msgObj, command);
    }
    pub.clear = (msgObj, command) => {
        musicPlr.clear(msgObj, command);
    }
    pub.repeat = (msgObj, command) => {
        musicPlr.repeat(msgObj, command);
    }
    pub.np = (msgObj, command) => {
        musicPlr.np(msgObj, command);
    }
    pub.volume = (msgObj, command) => {
        musicPlr.volume(msgObj, command);
    }
    pub.radio = (msgObj, command) => {
        musicPlr.radio(msgObj, command);
    }
    pub.radiokanavat = (msgObj, command) => {
        musicPlr.radiochannels(msgObj, command);
    }
    // pub.reloadchannels = (msgObj, command) => {
    //     musicPlr.reloadChannels(msgObj, command);
    // }
    // pub.reloadchannelshelp = () => {
    //     return musicPlr.reloadChannelsHelp();
    // }



    // vote command helpers

    pub.votehelp = () => {
        return voteHandler.voteHelp();
    }
    pub.votestatushelp = () => {
        return voteHandler.voteStatusHelp();
    }
    pub.endvotehelp = () => {
        return voteHandler.endVoteHelp();
    }
    pub.startvotehelp = () => {
        return voteHandler.startVoteHelp();
    }
    pub.voteoptionhelp = () => {
        return voteHandler.voteOptionHelp();
    }
    pub.createvotehelp = () => {
        return voteHandler.createVoteHelp();
    }
    pub.vuosihelp = () => {
        return year.yearHelp()
    }

    // music command helpers
    pub.playhelp = () => {
        return musicPlr.playHelp();
    }
    pub.playlisthelp = () => {
        return musicPlr.playlistHelp();
    }
    pub.skiphelp = () => {
        return musicPlr.skipHelp();
    }
    pub.clearhelp = () => {
        return musicPlr.clearHelp();
    }
    pub.repeathelp = () => {
        return musicPlr.repeatHelp();
    }
    pub.nphelp = () => {
        return musicPlr.npHelp();
    }
    pub.volumehelp = () => {
        return musicPlr.volumeHelp();
    }
    pub.radiohelp = () => {
        return musicPlr.radioHelp();
    }
    pub.radiokanavathelp = () => {
        return musicPlr.radiochannelsHelp();
    }

    pub.helphelp = () => {
        return help.helpHelp();
    }
    pub.patchnoteshelp = () => {
        return patchnotes.patchnotesHelp();
    }
    pub.infohelp = () => {
        return info.infoHelp();
    }

    pub.gifshelp = (msgObj, command) => {
        return msgGate.handleGifsHelp(msgObj, command)
    }
    pub.imageshelp = (msgObj, command) => {
        return msgGate.handleImagesHelp(msgObj, command)
    }
    pub.mutehelp = (msgObj, command) => {
        return msgGate.muteHelp(msgObj, command)
    }
    pub.unmutehelp = (msgObj, command) => {
        return msgGate.unmuteHelp(msgObj, command)
    }





    return pub;
}