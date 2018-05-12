const Discord = require("discord.js");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = (Client, id, color, results) => {
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

    var guild = {
        queue: [],

        prefix: prefix,

        isPlaying: false,
        isPaused: false,
        isShuffling: false,

        loopSong: false,
        loopQueue: false,

        djMode: djMode,
        djRole: djRole,
        votes: new Discord.Collection(),

        announceSongs: announceSongs,
        queueLength: queueLength,
        defaultVolume: defaultVolume,
        language: language,

        process: 0,
        interval: 0,
        check: null,
    }

    Client.servers.set(id, guild);
}