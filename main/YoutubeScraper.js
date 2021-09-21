const { Client } = require("youtubei");

module.exports = function () {
    const youtube = new Client();
    const pub = {}
    const WATCH_URL_PREFIX = "https://www.youtube.com/watch?v=";
    const NO_THUMBNAIL_URL = "https://cdn.discordapp.com/emojis/668116448668811266.png?v=1";
    const VIDEO_COUNT = 10;
    const PLAYLIST_COUNT = 100;
    const parseDuration = (seconds) => {
        let hours = Number.parseInt(seconds / 3600)
        let minutes = Number.parseInt(seconds % 3600 / 60);
        let _seconds = Number.parseInt(seconds % 3600 % 60);
        return hours + " h " + minutes + " min " + _seconds + " sec";
    }
    const findResults = (arguments) => {
        return youtube.search(arguments, { type: "video" }).then(results => {
            let videoArray = [];
            if (Array.isArray(results)) {
                let loopAmount = results.length > VIDEO_COUNT ? VIDEO_COUNT : results.length;
                for (let i = 0; i < loopAmount; ++i) {
                    let video = results[i];
                    let song = {
                        url: `https://www.youtube.com/watch?v=${video.id}`,
                        title: video.title,
                        thumbnail: video.thumbnails.length > 0 ? video.thumbnails[0].url : NO_THUMBNAIL_URL,
                        duration: parseDuration(video.duration),
                        radio: false
                    }
                    videoArray.push(song);
                }
            }
            return videoArray;

        });
    }
    pub.findResults = findResults;

    const findVideo = (videoId) => {
        return youtube.getVideo(videoId).then(res => {
            let video = res;
            let videoArray = [];
            if (res != null) {
                let song = {
                    url: `https://www.youtube.com/watch?v=${video.id}`,
                    title: video.title,
                    thumbnail: video.thumbnails.length > 0 ? video.thumbnails[0].url : NO_THUMBNAIL_URL,
                    duration: parseDuration(video.duration),
                    radio: false
                }
                videoArray.push(song)
            }

            return videoArray;
        })
    }
    pub.findVideo = findVideo;

    const findPlaylist = (playlistId) => {
        return youtube.getPlaylist(playlistId).then(res => {
            let videoArray = []
            if (Array.isArray(res.videos)) {
                let loopAmount = res.videos.length > PLAYLIST_COUNT ? PLAYLIST_COUNT : res.videos.length;
                for (let i = 0; i < loopAmount; ++i) {
                    let video = res.videos[i];
                    let song = {
                        url: `https://www.youtube.com/watch?v=${video.id}`,
                        title: video.title,
                        thumbnail: video.thumbnails.length > 0 ? video.thumbnails[0].url : NO_THUMBNAIL_URL,
                        duration: parseDuration(video.duration),
                        radio: false
                    }
                    videoArray.push(song);
                }
            }


            return videoArray
        })

    }
    pub.findPlaylist = findPlaylist;
    return pub;


}