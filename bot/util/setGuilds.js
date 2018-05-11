const Discord = require("discord.js");

module.exports.run = async (Client, guilds) => {

    var results = await Client.mysql.executeSelect(`SELECT * FROM guilds`);
    var guilds_client = Client.guilds.array();
    var check = 1;

    results.forEach(row => {
        if(Client.guilds.has(row.id)) {
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
    
            guilds[row.id] = {
                queue: [],
    
                prefix: prefix,
    
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
                interval: 0,
            }

            Client.log.info("[Init] Initialized guild " + row.name + " - Number " + check);
            check++;
        } else {
            Client.mysql.executeQuery(`DELETE FROM guilds WHERE id = '${row.id}'`);
            Client.log.info("[Init] Removed guild " + row.name);
        }
    });
}