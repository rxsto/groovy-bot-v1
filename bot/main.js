const Discord = require("discord.js");
const fs = require("fs");

const readdir = require("util").promisify(require("fs").readdir);

const { PlayerManager } = require("discord.js-lavalink");
const { MySql } = require("./util/mysqlConnection.js");

const Embed = require("./util/createEmbed.js");
const postServerCount = require("./util/postServerCount.js");
const voiceUpdate = require("./util/voiceUpdate.js");
const setGuild = require("./util/mysqlSet.js");
const Init = require("./util/setGuilds.js");
const logger = require("./util/logger.js");
const commandlist = require("./util/commandList.js");

const SetUp = require("./core/setUp.js");
const commandHandler = require("./core/commandHandler.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

var guilds = {};
var token = config.TEST;

const nodes = [
    { host: config.HOST1, port: config.PORT1, region: "eu", password: config.PASS1 },
    { host: config.HOST2, port: config.PORT2, region: "eu", password: config.PASS2 },
    { host: config.HOST3, port: config.PORT3, region: "eu", password: config.PASS3 },
    { host: config.HOST4, port: config.PORT4, region: "eu", password: config.PASS4 },
];

class musicBotClient extends Discord.Client {
    constructor(options) {
        super(options);
        this.embed = require("./util/createEmbed.js");
        this.log = require("./util/logger.js");
        this.commands = new Discord.Collection();
        this.playermanager = null;
        this.mysql = null;
        this.voted = {};
    }
}

const Client = new musicBotClient({ messageCacheMaxSize: 50, messageCacheLifetime: 3600, messageSweepInterval: 3600, disabledEvents: ['TYPING_START'] });

const init = async () => {
    await Client.login(token).then(Client.log.info("[Core] Successfully connected to Discord API"));
    Client.mysql = await new MySql("127.0.0.1", "bot", config.GLOBAL_PASS, "bot");
    await Init.run(Client, guilds);
    Client.playermanager = await new PlayerManager(Client, nodes, {
        user: Client.user.id,
        shards: 1
    });
    Client.playermanager.nodes.get(config.HOST1).on("disconnect", reason => {
        try {
            Client.playermanager.nodes.get(config.HOST1).connect();
        } catch (error) {
            Client.log.error("[Core] " + error);
        }
    });
    await SetUp.run(Client, token);
    if(token == config.TOKEN) await postServerCount.run(Client.guilds.size);
    try {
        readdir("./bot/commands/", (err, files) => {
            if(err) Client.log.error("[Core] " + err);

            var jsfiles = files.filter(f => f.split(".").pop() === "js");
            var jsaliases = commandlist.list;
            var jsaliases_length = Object.keys(jsaliases).length;

            Client.log.info("[Core] " + jsfiles.length + " commands found!");
            Client.log.info("[Core] " + jsaliases_length + " aliases found!");

            Object.keys(jsaliases).forEach(a => {
                var cmd = require(`./commands/${jsaliases[a]}`);
                Client.commands.set(a, cmd);
            });

            Client.log.info("[Core] All aliases were added!");
            Client.log.info("[Core] All commands were loaded!");
        });
    } catch (error) {
        Client.log.error("[Core] " + error);
    }

    try {
        Client.on("guildCreate", guild => {
            Client.log.info(`[GuildHandler] New guild joined: ${guild.name} (id: ${guild.id}) with ${guild.memberCount} members!`);
            const log_channel = Client.channels.get("411177077014790147");
            Embed.createEmbed(log_channel, `:white_check_mark: New guild joined: **${guild.name}** (id: ${guild.id}). This guild has **${guild.memberCount}** members!`, "Created");
            postServerCount.run(Client.guilds.size);

            try {
                setGuild.run(Client, guilds, guild, config.PREFIX, guild.me.displayColor);
            } catch (error) {
                Client.log.error("[Core] " + error);
            }
        });

        Client.on("guildDelete", guild => {
            Client.log.info(`[GuildHandler] Removed from: ${guild.name} (id: ${guild.id}) with ${guild.memberCount} members!`);
            const log_channel = Client.channels.get("411177077014790147");
            Embed.createEmbed(log_channel, `:no_entry: I have been removed from: **${guild.name}** (id: ${guild.id})`, "Removed");
            postServerCount.run(Client.guilds.size);

            try {    
                Client.mysql.executeQuery(`DELETE FROM guilds WHERE id = '${guild.id}'`);
            } catch (error) {
                Client.log.error("[Core] " + error);
            }
        });
    } catch (error) {
        Client.log.error("[Core] " + error);
    }

    try {
        Client.on('message', msg => {
            try {
                commandHandler.run(Client, guilds, Embed, msg);                
            } catch (error) {
                Client.log.error("[Core] " + error);
            }
        });
    } catch (error) {
        Client.log.error("[Core] " + error);
    }

    try {
        Client.on('voiceStateUpdate', (mold, mnew) => {
            voiceUpdate.run(Client, guilds, Embed, mold, mnew);
        });
    } catch (error) {
        Client.log.error("[VoiceStateUpdate] " + error);
    }
};

init();

process.on("unhandledRejection", error => logger.error(`unhandledRejection:\n${error.stack}`)).on("uncaughtException", error => logger.error(`uncaughtException:\n${error.stack}`)).on("error", error => logger.error(`Error:\n${error.stack}`)).on("warn", error => logger.error(`Warning:\n${error.stack}`));