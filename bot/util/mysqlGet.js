const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = (Client, guilds, id, color, results) => {
    var name;
    var prefix;
    var djMode;
    var djRole;
    var announceSongs;
    var queueLength;
    var defaultVolume;
    var language;

    results.forEach( (row) => {
        name = row.name;
        prefix = row.prefix;
        if(row.djMode == 0) {
            djMode = false;
        } else {
            djMode = true;
        }
        djRole = row.djRole;
        if(row.announceSongs == 0) {
            announceSongs = false;
        } else {
            announceSongs = true;
        }
        queueLength = row.queueLength;
        defaultVolume = row.defaultVolume;
        language = row.language;
    });

    if(!guilds[id]) {
        guilds[id] = {
            queue: [],

            prefix: prefix,
            color: color,

            isPlaying: false,
            isPaused: false,
            isShuffling: false,

            loopSong: false,
            loopQueue: false,

            djMode: false,
            djRole: djRole,
            votes: 0,

            announceSongs: announceSongs,
            queueLength: queueLength,
            defaultVolume: defaultVolume,
            language: language,

            process: 0,
            interval: null
        }
    }
}