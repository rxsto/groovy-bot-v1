const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const superagent = require('superagent');
const fs = require("fs");
const PlexiDevApi = require('plexibotsapi');

const readdir = require("util").promisify(require("fs").readdir);

const log = require("./logger.js");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

let api = new PlexiDevApi(config.LIST_PLEXI);

module.exports = {
    async getSong(string) {
        const res = await snekfetch.get(`http://localhost:2333/loadtracks`).query({ identifier: string }).set("Authorization", config.GLOBAL_PASS).catch(err => {
            console.error(err);
            return null;
        });

        if (!res) throw "There was an error, try again";
        if (!res.body.length) throw "No tracks found";
        return res.body;
    },

    async postcount(Client) {
        var server_count;
        await Client.shard.fetchClientValues('guilds.size').then(results => {
            server_count = results.reduce((prev, val) => prev + val, 0);
        }).catch(console.error);
        
        const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization", config.Groovy.TOKEN);
    
        snekfetch.post(`https://discordbots.org/api/bots/stats`)
            .set('Authorization', config.LIST_ORG)
            .send({
                "shard_count": totalShards,
                "server_count": server_count
            })
            .then()
            .catch(err => log.error("[PostServerCount] 1 " + err));
    
        snekfetch.post("https://botlist.space/api/bots/402116404301660181")
            .set("Authorization", config.LIST_SPACE)
            .send({
                "shard_count": totalShards,
                "server_count": server_count
            })
            .then()
            .catch(err => log.error("[PostServerCount] 2 " + err));
    
        snekfetch.post("https://bots.discord.pw/api/bots/402116404301660181/stats")
            .set("Authorization", config.LIST_PW)
            .send({
                "shard_count": totalShards,
                "server_count": server_count
            })
            .then()
            .catch(err => log.error("[PostServerCount] 3 " + err));
    
        api.postServers(Client.user.id, Client.guilds.size);
        api.postUsers(Client.user.id, Client.users.size);
    
        snekfetch.post("https://botsfordiscord.com/api/v1/bots/402116404301660181")
            .set("Authorization", config.LIST_FOR)
            .send({
                "server_count": server_count
            })
            .then()
            .catch(err => log.error("[PostServerCount] 4 " + err));
    
        log.info("[PostServerCount] Successfully posted current server-count");
    },

    checkDJ(guild, msg) {
        if(guild.djMode) {
            if(msg.member.hasPermission("KICK_MEMBERS", false, true, true)) return true;
            if(!msg.member.roles.find("name", guild.djRole)) {
                return false;
            } else {
                return true;
            }
        }
    },

    checkPatron(Client, guild, texts, msg, level, info) {
        if(Client.voted[msg.author.id]) if(Client.voted[msg.author.id].premium == true) return true;
        var check = false;

        if(Client.patrons.has(msg.guild.id)) {
            check = true;
        } else {
            if(Client.patrons.has(msg.author.id)) {
                check = true;
            } else {
                check = false;
            }
        }
    
        if(check == false) {
            if(info) Client.functions.createEmbed(msg.channel, texts.no_patron1 + guild.prefix + texts.no_patron2, texts.error_title);
            return false;
        }
    
        check = false;
    
        if(Client.patrons.get(msg.guild.id)) {
            if(Client.patrons.get(msg.guild.id).level >= level) {
                check = true;
            } else {
                if(Client.patrons.get(msg.author.id).level >= level) {
                    check = true;
                } else {
                    check = false;
                }
            }
        } else {
            if(Client.patrons.get(msg.author.id).level >= level) {
                check = true;
            } else {
                check = false;
            }
        }
    
        if(check == false) {
            if(info) Client.functions.createEmbed(msg.channel, texts.low_patron, texts.error_title);
            return false;
        }

        return check;
    },

    createEmbed(channel, content, title) {
        if(channel == null || content == null || title == null) return;
        var message;
        var emb = new Discord.RichEmbed();
        
        emb.setDescription(content);
        emb.setColor(channel.guild.me.displayColor);
        emb.setTitle(title)
        
        channel.send(emb).then((m) => {
            message = m
        });
        
        random_emb();

        return message;
        
        function random_emb() {
            var vote_embed = new Discord.RichEmbed();
            vote_embed.setDescription(":mega: You want to get access to Patrons-only features? You can test them daily for 2 hours by upvoting Groovy! You need to upvote [here](https://discordbots.org/bot/402116404301660181/vote) and check the vote command!");
            vote_embed.setColor(channel.guild.me.displayColor);
            vote_embed.setTitle("Patrons-only features! Vote up!");
    
            var check = Math.floor((Math.random() * 100) + 1);
    
            if(check == 42) channel.send(vote_embed);
        }
    },

    returnEmbed(content, title) {
        var emb = new Discord.RichEmbed();
        
        emb.setDescription(content);
        emb.setTitle(title);

        return emb;
    },

    checkGuild(Client, guild, prefix, color) {
        var results = Client.mysql.executeSelect(`SELECT * FROM guilds WHERE id = '${guild.id}'`);

        if (results.length > 0) {
            this.getGuild(Client, guild.id, color, results);
        } else {
            this.setGuild(Client, guild, prefix, color);
        }
    },

    getGuild(Client, id, color, results) {
        var prefix;
        var djMode;
        var djRole;
        var announceSongs;
        var queueLength;
        var defaultVolume;
        var language;
    
        results.forEach( (row) => {
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
            collector: null,
        }
    
        Client.servers.set(id, guild);
    },

    setGuild(Client, guild, prefix, color) {

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
                queueLength: 50,
                defaultVolume: 100,
                language: "en",
    
                process: 0,
                interval: 0,
                check: null,
                collector: null,
            }
    
            Client.servers.set(guild.id, set_guild);
        }
    
        var sql = `INSERT INTO guilds (id, prefix, djMode, djRole, announceSongs, queueLength, defaultVolume, language) VALUES ('${guild.id}', '${config.PREFIX}', '0', 'DJ', '1', '50', '100', 'en')`;
        
        try {    
            Client.mysql.executeQuery(sql);
        } catch (error) {
            console.log(error);
        }
    },

    reload(Client) {
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
    
                console.log(name);

                Client.patrons.set(id, object);
            });
        });
    }
}