const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = (Client, guilds, guild, prefix, color) => {

    if(!guilds[guild.id]) {
        guilds[guild.id] = {
            queue: [],

            prefix: config.PREFIX,

            isPlaying: false,
            isPaused: false,
            isShuffling: false,

            loopSong: false,
            loopQueue: false,

            djMode: false,
            djRole: "DJ",
            votes: 0,

            announceSongs: true,
            queueLength: 25,
            defaultVolume: 100,
            language: "en",

            process: 0,
            interval: 0,
        }
    }

    if(!guild) return;
    if(!guild.id) return;
    if(!guild.name) return;

    var name = guild.name;
    var push_name = name.replace("'", " ");

    var sql = `INSERT INTO guilds (id, name, prefix, djMode, djRole, announceSongs, queueLength, defaultVolume, language) VALUES ('${guild.id}', '${push_name}', '${config.PREFIX}', '0', 'DJ', '1', '50', '100', 'en')`;
    
    try {    
        Client.mysql.executeQuery(sql);
    } catch (error) {
        console.log(error);
    }
}