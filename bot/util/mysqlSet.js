const Discord = require("discord.js");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = (Client, guild, prefix, color) => {

    if(!Client.guilds.has(guild.id)) {
        var set_guild = {
            queue: [],

            prefix: config.PREFIX,

            isPlaying: false,
            isPaused: false,
            isShuffling: false,
            loopSong: false,
            loopQueue: false,

            djMode: false,
            djRole: "DJ",
            votes: new Discord.Collection(),

            announceSongs: true,
            queueLength: 25,
            defaultVolume: 100,
            language: "en",

            process: 0,
            interval: 0,
            check: null,
        }

        Client.servers.set(guild.id, set_guild);
    }

    var name = guild.name.replace("'", " ");

    var sql = `INSERT INTO guilds (id, name, prefix, djMode, djRole, announceSongs, queueLength, defaultVolume, language) VALUES ('${guild.id}', '${name}', '${config.PREFIX}', '0', 'DJ', '1', '50', '100', 'en')`;
    
    try {    
        Client.mysql.executeQuery(sql);
    } catch (error) {
        console.log(error);
    }
}