const Discord = require("discord.js");
const Lavalink = require("discord.js-lavalink");
const fs = require("fs");
const superagent = require("superagent");
const Long = require("long");

const Connection = require("./util/mysql.js");
const logger = require("./util/logger.js");

const commandlist = require("./list/commandList.js");

const SetUp = require("./core/setUp.js");
const commandHandler = require("./core/commandHandler.js");

const readdir = require("util").promisify(require("fs").readdir);

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));
const texts = JSON.parse(fs.readFileSync("./bot/json/lang/en.json", "utf8"));

const token = config.Test.TOKEN;

const nodes = config.nodes;

class Groovy extends Discord.Client {
    constructor(options) {
        super(options);
        this.useable = true;
        this.functions = require("./util/functions.js");
        this.log = require("./util/logger.js");
        this.config = require("./json/config.js");
        this.commands = new Discord.Collection();
        this.servers = new Discord.Collection();
        this.patrons = new Discord.Collection();
        this.voted = new Discord.Collection();
        this.playermanager = null;
        this.webhook = null;
        this.mysql = null;
        this.dbl = null;
        this.executed = 0;
    }
}

const Client = new Groovy({ messageCacheMaxSize: 100, messageCacheLifetime: 86400, messageSweepInterval: 86400, disabledEvents: ['TYPING_START'] });

const init = async () => {
    Client.shard.send("3");
    await Client.login(token).then(Client.log.info("[Core] Successfully connected to Discord API"));
    Client.shard.send("2");
    Client.mysql = new Connection.MySql("127.0.0.1", "bot", "bot");
    const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization", config.Groovy.TOKEN);
    Client.playermanager = new Lavalink.PlayerManager(Client, nodes, {
        user: Client.user.id,
        shards: totalShards
    });
    await SetUp.run(Client, await Client.guilds.array(), token);
    if(token == config.TOKEN) await Client.functions.postcount(Client, Client.guilds.size);

    Client.webhook = new Discord.WebhookClient("450345181053583362", config.webhooks.logs);

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

        Client.log.info("[Shard " + (Client.shard.id + 1) + "] [Core] " + jsfiles.length + " commands found!");
        Client.log.info("[Shard " + (Client.shard.id + 1) + "] [Core] " + jsaliases_length + " aliases found!");

        Object.keys(jsaliases).forEach(a => {
            var cmd = require(`./commands/${jsaliases[a]}`);
            Client.commands.set(a, cmd);    
        });

        Client.log.info("[Shard " + (Client.shard.id + 1) + "] [Core] All aliases were added!");
        Client.log.info("[Shard " + (Client.shard.id + 1) + "] [Core] All commands were loaded!");
    });
    
    Client.log.info(`[Shard ${(Client.shard.id + 1)}] [Setup] The bot on shard ${Client.shard.id + 1} has started, with ${Client.users.size} users, in ${Client.channels.size} channels of ${Client.guilds.size} guilds.`);
    Client.setMaxListeners(100);
    process.Client = Client;

    if(Client.token === config.Groovy.TOKEN) {
        var guild = Client.guilds.get("403882830225997825");

        if(guild != null) {
            var dailyid;
            var currentid;
    
            var category = guild.channels.get("451387368721612810");
    
            await category.children.array().forEach(channel => {
                channel.delete();
            });
    
            await guild.createChannel("stats", "text").then(channel => {
                channel.setParent("451387368721612810");
                currentid = channel.id;
            });
    
            await guild.createChannel("daily", "text").then(channel => {
                channel.setParent("451387368721612810");
                dailyid = channel.id;
            });
    
            require("./modules/dailyStats.js")(Client, dailyid);
            require("./modules/currentStatistics.js")(Client, currentid);
        }
        
        //require("./modules/webDashboard.js")(Client);
    }

    Client.shard.send("0");

    Client.on("error", error => {
        logger.error("[Shard " + (Client.shard.id + 1) + "] [Core] " + error);
        Client.shard.send("1");
    });

    Client.on("guildCreate", guild => {
        Client.log.info(`[Shard ${(Client.shard.id + 1)}] [GuildHandler] New guild joined: ${guild.name} (id: ${guild.id}) with ${guild.memberCount} members!`);
        var guildlog = Client.functions.returnEmbed(`:white_check_mark: [Shard ${(Client.shard.id + 1)}] New guild joined: **${guild.name}** (id: ${guild.id}). This guild has **${guild.memberCount}** members!`, "Joined");
        Client.webhook.send({ embeds: [guildlog] });
        Client.functions.postcount(Client);

        try {
            Client.functions.setGuild(Client, guild, config.PREFIX, guild.me.displayColor);
        } catch (error) {
            Client.log.error("[Shard " + (Client.shard.id + 1) + "] [Core] " + error);
        }

        var channel = guild.channels
        .filter(c => c.type === "text" &&
          c.permissionsFor(guild.me).has("SEND_MESSAGES"))
        .sort((a, b) => a.position - b.position ||
          Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
        .first();

        if(channel == null) return;
        if(!guild.me.permissionsIn(channel).has("SEND_MESSAGES")) return;

        Client.functions.createEmbed(channel, texts.general_first_join_text, texts.general_first_join_title);
    });

    Client.on("guildDelete", guild => {
        Client.log.info(`[Shard ${(Client.shard.id + 1)}] [GuildHandler] Removed from: ${guild.name} (id: ${guild.id}) with ${guild.memberCount} members!`);
        var guildlog = Client.functions.returnEmbed(`:no_entry: [Shard ${(Client.shard.id + 1)}] I have been removed from: **${guild.name}** (id: ${guild.id})`, "Removed");
        Client.webhook.send({ embeds: [guildlog] });
        Client.functions.postcount(Client);

        try {    
            Client.mysql.executeQuery(`DELETE FROM guilds WHERE id = '${guild.id}'`);
        } catch (error) {
            Client.log.error(`[Shard ${(Client.shard.id + 1)}] [Core] ` + error);
        }

        var server = Client.servers.get(guild.id);

        Client.playermanager.leave(guild.id);
        clearInterval(server.interval);
        server.queue = [];
        server.previous = null;
        server.votes.clear();
        server.process = 0;
        server.isPaused = false;
        server.isPlaying = false;

        guild.owner.send(texts.general_left_text);
    });

    Client.on('message', async msg => {
        if(Client.useable == false) return;
        if(msg.channel.type != "text") return;
        if(msg.author.bot) return;
        if(Client.servers.has(msg.guild.id)) {
            if(msg.content.startsWith(Client.servers.get(msg.guild.id).prefix) || msg.content.startsWith('<@'+Client.user.id+'>') || msg.content.startsWith('<@!'+Client.user.id+'>')) {
                commandHandler.run(Client, msg);
            }
        } else {
            await Client.functions.checkGuild(Client, msg.guild, config.PREFIX, msg.guild.me.displayColor);
            if(msg.guild.me.permissionsIn(msg.channel).has("USE_EXTERNAL_EMOJIS")) {
                msg.channel.send("<:check:449207827026673677> " + texts.general_init_guild).then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 2500);
                });
            } else {
                msg.channel.send(":white_check_mark: " + texts.general_init_guild).then(msg => {
                    setTimeout(() => {
                        msg.delete();
                    }, 2500);
                });
            }
        }
    });
};

init();

module.exports.getClient = () => {
    return Client;
}

process.on("unhandledRejection", error => logger.error(`[Shard ${(Client.shard.id + 1)}] unhandledRejection:\n${error.stack}`)).on("uncaughtException", error => logger.error(`[Shard ${(Client.shard.id + 1)}] uncaughtException:\n${error.stack}`)).on("error", error => logger.error(`[Shard ${(Client.shard.id + 1)}] Error:\n${error.stack}`)).on("warn", error => logger.error(`[Shard ${(Client.shard.id + 1)}] Warning:\n${error.stack}`));