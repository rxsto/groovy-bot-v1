const Discord = require("discord.js");
const Lavalink = require("discord.js-lavalink");
const fs = require("fs");
const colors = require("colors");
const superagent = require("superagent");
const Long = require("long");

const readdir = require("util").promisify(require("fs").readdir);

const Connection = require("../util/mysql.js");

const commandlist = require("../list/commandList.js");

exports.run = async (Client, guilds, debug, token) => {
    Client.appInfo = await Client.fetchApplication();
    setInterval( async () => {
        Client.appInfo = await Client.fetchApplication();
    }, 60000);

    Client.emotes.set("check", "<:check:449207827026673677> ");
    Client.emotes.set("error", "<:error:449207829619015680> ");
    Client.emotes.set("info", "<:info:455302054689374239> ");
    Client.emotes.set("warning", ":warning: ");
    Client.emotes.set("point", ":white_small_square: ");

    Client.shard.send("2");
    Client.mysql = new Connection.MySql("127.0.0.1", "bot", "bot");
    const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization", (debug == true ? Client.config.Test.TOKEN : Client.config.Groovy.TOKEN));
    Client.playermanager = new Lavalink.PlayerManager(Client, Client.config.nodes, {
        user: Client.user.id,
        shards: totalShards,
    });  

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
            djMode: djMode,
            djRole: guild.djRole,
            announceSongs: announceSongs,
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
        
    info(`[Shard ${Client.shard.id + 1}] [SetUp] Initialized ${guilds_check} guilds`);

    if(debug == false) await Client.functions.postcount(Client, Client.guilds.size);

    Client.webhook = new Discord.WebhookClient("450345181053583362", Client.config.webhooks.logs);

    readdir("./bot/events/", (err, files) => {
        files.forEach(file => {
            const event = require(`../events/${file}`);
            Client.on(file.split(".")[0], (...args) => event(Client, ...args));
            delete require.cache[require.resolve(`../events/${file}`)];
        });
    });

    readdir("./bot/list/patrons/", (err, files) => {
        files.forEach(file => {
            var id = file.split(".")[0];

            var patron = JSON.parse(fs.readFileSync("./bot/list/patrons/" + file, "utf8"));
            var name = patron.name;
            var type = patron.type;
            var level = patron.level;

            var object = {
                name: name,
                type: type,
                level: level,
            }

            Client.patrons.set(id, object);
        });
    });
    
    readdir("./bot/commands/", (err, files) => {
        if(err) Client.log.error("[Shard " + (Client.shard.id + 1) + "] [Core] " + err);

        var jsfiles = files.filter(f => f.split(".").pop() === "js");
        var jsaliases = commandlist.list;
        var jsaliases_length = Object.keys(jsaliases).length;

        info("[Shard " + (Client.shard.id + 1) + "] [Core] " + jsfiles.length + " commands found!");
        info("[Shard " + (Client.shard.id + 1) + "] [Core] " + jsaliases_length + " aliases found!");

        Object.keys(jsaliases).forEach(a => {
            var cmd = require(`../commands/${jsaliases[a]}`);
            Client.commands.set(a, cmd);
        });

        info("[Shard " + (Client.shard.id + 1) + "] [Core] All aliases were added!");
        info("[Shard " + (Client.shard.id + 1) + "] [Core] All commands were loaded!");
    });

    info(`[Shard ${(Client.shard.id + 1)}] [Setup] The bot on shard ${Client.shard.id + 1} has started, with ${Client.users.size} users, in ${Client.channels.size} channels of ${Client.guilds.size} guilds.`);
    Client.setMaxListeners(100);
    process.Client = Client;

    if(debug == false) {
        var guild = Client.guilds.get("403882830225997825");

        if(guild != null) {
            var dailyid;
            var currentid;
    
            var category = guild.channels.get("451387368721612810");

            var permissions = category.permissionOverwrites.array();
    
            await category.children.array().forEach(channel => {
                channel.delete();
            });
    
            await guild.createChannel("stats", "text", permissions, "Groovy Init").then(channel => {
                channel.setParent("451387368721612810");
                currentid = channel.id;
            });
    
            await guild.createChannel("daily", "text", permissions, "Groovy Init").then(channel => {
                channel.setParent("451387368721612810");
                dailyid = channel.id;
            });
    
            require("../modules/dailyStats.js")(Client, dailyid);
            require("../modules/currentStatistics.js")(Client, currentid);
        }
        
        //require("./modules/webDashboard.js")(Client);
    }

    Client.shard.send("0");

    Client.user.setPresence({ game: { name: "" }, status: "online" });  

    const groovy = Client.guilds.get("403882830225997825");
    if(!groovy) return;

    if(token == Client.config.Groovy.TOKEN) {
        const player = await Client.playermanager.join({
            guild: "403882830225997825",
            channel: "404312098970140672",
            host: "127.0.0.1",
        });
    }

    info("[Shard " + (Client.shard.id + 1) + "] [Setup] Successfully joined Voice-Channel");

    async function rejoin() {
        var vc = Client.guilds.get("403882830225997825").channels.get("404312098970140672");
        var members = vc.members;
        if(members > 1) {
            setTimeout(() => {
                rejoin();
            }, 3600000);
        } else {
            Client.playermanager.leave("403882830225997825");
            const player = await Client.playermanager.join({
                guild: "403882830225997825",
                channel: "404312098970140672",
                host: "127.0.0.1",
            });
        }
    }

    setInterval(() => {
        rejoin();
    }, 86400000);
}

function info(content) {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    content.split('\n').forEach(s => {
        console.log(`[${time}] ` + colors.green(` ${'[ INFO ]'} `) + ` ${s}`);
        write_info(`[${time}] ` + ` ${'[ INFO ]'} ` + ` ${s}`);
    });
}

function write_info(text) {
    var time = new Date().toISOString().split("T")[0];

    fs.stat(`logs/Groovy_Info_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Groovy_Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Groovy_Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}