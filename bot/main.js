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

const nodes = [
    { host: config.nodes.alfHOST, port: config.nodes.alfPORT, region: "eu", password: config.nodes.alfPASS },
    { host: config.nodes.zapHOST, port: config.nodes.zapPORT, region: "eu", password: config.nodes.zapPASS },
    { host: config.nodes.leeHOST, port: config.nodes.leePORT, region: "eu", password: config.nodes.leePASS },
    { host: config.nodes.yanHOST, port: config.nodes.yanPORT, region: "eu", password: config.nodes.yanPASS },
    { host: config.nodes.lsgHOST, port: config.nodes.lsgPORT, region: "eu", password: config.nodes.lsgPASS },
];

class Groovy extends Discord.Client {
    constructor(options) {
        super(options);
        this.functions = require("./util/functions.js");
        this.log = require("./util/logger.js");
        this.config = require("./json/config.js");
        this.commands = new Discord.Collection();
        this.servers = new Discord.Collection();
        this.patrons = new Discord.Collection();
        this.playermanager = null;
        this.webhook = null;
        this.mysql = null;
        this.executed = 0;
        this.voted = {};
    }
}

const Client = new Groovy({ messageCacheMaxSize: 100, messageCacheLifetime: 86400, messageSweepInterval: 86400, disabledEvents: ['TYPING_START'] });

const init = async () => {
    await Client.login(token).then(Client.log.info("[Core] Successfully connected to Discord API"));
    Client.mysql = new Connection.MySql("127.0.0.1", "bot", config.GLOBAL_PASS, "bot");
    const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization", config.Groovy.TOKEN);
    Client.playermanager = await new Lavalink.PlayerManager(Client, nodes, {
        user: Client.user.id,
        shards: totalShards
    });
    await SetUp.run(Client, token);
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
        //require("./modules/dailyStats.js");
        //require("./modules/currentStatistics.js");
        //require("./modules/webDashboard.js")(Client);
    }

    Client.on("error", error => {
        logger.error("[Shard " + (Client.shard.id + 1) + "] [Core] " + error);
    });

    Client.on("guildCreate", guild => {
        Client.log.info(`[Shard ${(Client.shard.id + 1)}] [GuildHandler] New guild joined: ${guild.name} (id: ${guild.id}) with ${guild.memberCount} members!`);
        var guildlog = Client.functions.returnEmbed(`:white_check_mark: [Shard ${(Client.shard.id + 1)}] New guild joined: **${guild.name}** (id: ${guild.id}). This guild has **${guild.memberCount}** members!`, "Created");
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

        Client.functions.createEmbed(channel, texts.first_join, texts.first_join_title);
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
    });

    Client.on('message', async msg => {
        if(msg.channel.type == "dm" || msg.channel.type == "group") return;
        if(msg.guild == null) return;
        if(Client.servers.has(msg.guild.id)) {
            if(msg.content.startsWith(Client.servers.get(msg.guild.id).prefix) || msg.content.startsWith('<@'+Client.user.id+'>') || msg.content.startsWith('<@!'+Client.user.id+'>')) {
                await commandHandler.run(Client, await msg);
            }
        } else {
            await Client.functions.checkGuild(Client, msg.guild, config.PREFIX, msg.guild.me.displayColor);
            await commandHandler.run(Client, await msg);
        }
    });
};

init();

process.on("unhandledRejection", error => logger.error(`[Shard ${(Client.shard.id + 1)}] unhandledRejection:\n${error.stack}`)).on("uncaughtException", error => logger.error(`[Shard ${(Client.shard.id + 1)}] uncaughtException:\n${error.stack}`)).on("error", error => logger.error(`[Shard ${(Client.shard.id + 1)}] Error:\n${error.stack}`)).on("warn", error => logger.error(`[Shard ${(Client.shard.id + 1)}] Warning:\n${error.stack}`));