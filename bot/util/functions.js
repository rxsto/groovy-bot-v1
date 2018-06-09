const Discord = require("discord.js");
const snekfetch = require("snekfetch");
const superagent = require('superagent');
const fs = require("fs");

const readdir = require("util").promisify(require("fs").readdir);

const main = require("../main.js");

const log = require("./logger.js");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

module.exports = {
    async getSong(string) {
        const res = await snekfetch.get(`http://81.30.144.101:2333/loadtracks`).query({ identifier: string }).set("Authorization", config.GLOBAL_PASS).catch(err => {
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
        var user_count;
        await Client.shard.fetchClientValues('users.size').then(results => {
            user_count = results.reduce((prev, val) => prev + val, 0);
        }).catch(console.error);

        var sql = `UPDATE stats SET servers = '${server_count}', members = '${user_count}' WHERE id = '402116404301660181'`;
        Client.mysql.executeQuery(sql);
        
        const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization", config.Groovy.TOKEN);
    
        snekfetch.post(`https://discordbots.org/api/bots/stats`)
            .set('Authorization', config.keys.dbl)
            .send({
                "shard_count": totalShards,
                "server_count": server_count
            })
            .then()
            .catch(err => log.error("[PostServerCount] 1 " + err));
    
        snekfetch.post("https://botlist.space/api/bots/402116404301660181")
            .set("Authorization", config.keys.space)
            .send({
                "shard_count": totalShards,
                "server_count": server_count
            })
            .then()
            .catch(err => log.error("[PostServerCount] 2 " + err));
    
        snekfetch.post("https://bots.discord.pw/api/bots/402116404301660181/stats")
            .set("Authorization", config.keys.discordpw)
            .send({
                "shard_count": totalShards,
                "server_count": server_count
            })
            .then()
            .catch(err => log.error("[PostServerCount] 3 " + err));
    
        snekfetch.post("https://botsfordiscord.com/api/v1/bots/402116404301660181")
            .set("Authorization", config.keys.botsfor)
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
        if(Client.voted.has(msg.author.id)) if(Client.voted.get(msg.author.id).premium == true) return true;
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
            if(info) Client.functions.createEmbed(msg.channel, texts.general_no_patron_text_1 + guild.prefix + texts.general_no_patron_text_2, texts.error_title);
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
            if(info) Client.functions.createEmbed(msg.channel, texts.general_to_low_patron, texts.error_title);
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
        emb.setAuthor(title, main.getClient().user.avatarURL);
        channel.send(emb);
    },

    returnEmbed(content, title) {
        var emb = new Discord.RichEmbed();
        
        emb.setDescription(content);
        emb.setAuthor(title, main.getClient().user.avatarURL);

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
            previous: null,
    
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
                previous: null,
    
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

            Client.functions.createEmbed(msg.channel, "Successfully reloaded patrons!", "Reloaded patrons");
        });
    },

    upvote(Client, id) {
        Client.log.info("[Vote-System] User with id " + id + " voted for the bot!");
        if(Client.voted.has(id)) {
            Client.voted.get(id).premium = true;
        } else {
            var user = {
                premium: true,
            }
            Client.voted.set(id, user);
        }

        console.log(Client.voted);
        setTimeout( () => {
            Client.voted.get(id).premium = false;
        }, 3600000);
    },

    update(Client) {
        Client.useable = false;

        var players = Client.playermanager.array();

        players.forEach(async player => {
            await player.volume(0);
            setTimeout(async () => {
                await Client.playermanager.leave(player.id);
            }, 2000);
            var guild = Client.guilds.get(player.id);
            if(!guild.me.lastMessage.channel) return;
            Client.functions.createEmbed(guild.me.lastMessage.channel, texts.general_update_text, texts.general_update_title);
        });

        Client.functions.createEmbed(msg.channel, "Successfully started update!", "Started update");
    },

    checkPermissions(Client, msg) {
        if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) {
            msg.author.send("<:error:449207829619015680> I am not allowed to send messages into this channel! Please check my permissions!");
            return false;
        }

        if(!msg.guild.me.permissionsIn(msg.channel).has("USE_EXTERNAL_EMOJIS")) {
            Client.functions.createEmbed(":x: I am not allowed to use external emojis in this channel! Please check my permissions!", "Error");
            return false;
        }

        if(!msg.guild.me.permissionsIn(msg.channel).has("EMBED_LINKS")) {
            Client.functions.createEmbed(":x: I am not allowed to send links into this channel! Please check my permissions!", "Error");
            return false;
        }

        if(!msg.guild.me.permissionsIn(msg.channel).has("ADD_REACTIONS")) {
            Client.functions.createEmbed(":x: I am not allowed to add reactions to this message! Please check my permissions!", "Error");
            return false;
        }

        return true;
    },

    restart(Client, id) {
        if(id) if((Client.shard.id + 1) != id) return;
        Client.shard.send("3");
        process.exit(0);
    }
}