const Discord = require("discord.js");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

exports.run = async (Client, guilds, token) => {
    Client.appInfo = await Client.fetchApplication();
    setInterval( async () => {
        Client.appInfo = await Client.fetchApplication();
    }, 60000);

    Client.user.setPresence({ game: { name: "" }, status: "online" });    

    var results = await Client.mysql.executeSelect(`SELECT * FROM guilds`);

    var servers = new Discord.Collection();

    results.forEach(guild => {
        var id = guild.id;

        var djMode = false;
        var announceSongs = false;

        if(guild.djMode == 1) djMode = true;
        if(guild.announceSongs == 1) announceSongs = true;

        var guild = {
            prefix: guild.prefix,
            djMode: guild.djMode,
            djRole: guild.djRole,
            announceSongs: guild.announceSongs,
            queueLength: guild.queueLength,
            defaultVolume: guild.defaultVolume,
            language: guild.language,
        }

        servers.set(id, guild);
    });

    var guilds_check = 0;

    guilds.forEach(async guild => {
        if(servers.has(guild.id)) {
            var server = servers.get(guild.id);
            var id = guild.id;
            var guild = {
                queue: [],
        
                prefix: server.prefix,

                isPlaying: false,
                isPaused: false,
                isShuffling: false,
                loopSong: false,
                loopQueue: false,
        
                djMode: server.djMode,
                djRole: server.djRole,
                votes: new Discord.Collection(),
        
                announceSongs: server.announceSongs,
                queueLength: server.queueLength,
                defaultVolume: server.defaultVolume,
                language: server.language,
        
                process: 0,
                interval: 0,
                check: null,
                collector: null,
            }
            Client.servers.set(id, guild);
            guilds_check++;
        }
    });
        
    Client.log.info(`[Shard ${Client.shard.id + 1}] [SetUp] Initialized ${guilds_check} guilds`);

    const guild = Client.guilds.get("403882830225997825");
    if(!guild) return;

    if(token == config.Groovy.TOKEN) {
        const player = await Client.playermanager.join({
            guild: guild.id,
            channel: "404312098970140672",
            host: "127.0.0.1"
        });
    }

    Client.log.info("[Shard " + (Client.shard.id + 1) + "] [Setup] Successfully joined Voice-Channel");
}