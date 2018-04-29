const Discord = require("discord.js");
const fs = require("fs");

const readdir = require("util").promisify(require("fs").readdir);

const { PlayerManager } = require("discord.js-lavalink");
const { MySql } = require("./util/mysqlConnection.js");

const Embed = require("./util/createEmbed.js");
const postServerCount = require("./util/postServerCount.js");
const voiceUpdate = require("./util/voiceUpdate.js");
const setGuild = require("./util/mysqlSet.js");
const logger = require("./util/logger.js");
const SetUp = require("./core/setUp.js");
const commandHandler = require("./core/commandHandler.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

var guilds = {};
var token = config.TEST;
var prefix = config.PREFIX;

const nodes = [
    { host: config.HOST, port: config.PORT, region: "eu", password: config.PASS },
    { host: config.HOST2, port: config.PORT2, region: "eu", password: config.PASS2 }
];

class musicBotClient extends Discord.Client {
    constructor(options) {
        super(options);
        this.config = require("./json/config.json");
        this.embed = require("./util/createEmbed.js");
        this.log = require("./util/logger.js");
        this.playermanager = null;
        this.mysql = null;
        this.voted = {};
        this.commands = new Discord.Collection();
    }
}

const Client = new musicBotClient({ messageCacheMaxSize: 50, messageCacheLifetime: 3600, messageSweepInterval: 3600, disabledEvents: ['TYPING_START'] });

const init = async () => {
    await Client.login(token).then(Client.log.info("[Core] Successfully connected to Discord API"));
    Client.mysql = await new MySql(config.HOST, config.USER, config.PASS, config.DATABASE);
    Client.playermanager = await new PlayerManager(Client, nodes, {
        user: Client.user.id,
        shards: 1
    });
    Client.playermanager.nodes.get(config.HOST).on("disconnect", reason => {
        try {
            Client.playermanager.nodes.get(config.HOST).connect();
        } catch (error) {
            Client.log.error("[Core] " + error);
        }
    });
    await SetUp.run(Client);
    await postServerCount.run(Client.guilds.size);
    try {
        readdir("./bot/commands/", (err, files) => {
            if(err) Client.log.error("[Core] " + err);

            var jsfiles = files.filter(f => f.split(".").pop() === "js");
            
            Client.log.info("[Core] " + jsfiles.length + " commands found!");

            jsfiles.forEach((f, i) => {
                var cmd = require(`./commands/${f}`);
                Client.log.info("[Core] Command " + f + " loading...");
                var name = f.split(".")[0];
                Client.commands.set(name, cmd);
            });
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
    } catch (e) {
        Client.log.error("[Core] " + error);
    }

    try {
        Client.on('message', msg => {
            commandHandler.run(Client, guilds, Embed, msg);
        });
    } catch (e) {
        Client.log.error("[Core] " + error);
    }

    try {
        Client.on('voiceStateUpdate', (mold, mnew) => {
            if(!guilds[mold.guild.id]) return;
            voiceUpdate.run(Client, guilds, Embed, mold, mnew);
        });
    } catch (e) {
        Client.log.error("[Core] " + error);
    }
};

init();

process.on("unhandledRejection", error => console.log(`unhandledRejection:\n${error.stack}`)).on("uncaughtException", error => console.log(`uncaughtException:\n${error.stack}`)).on("error", error => console.log(`Error:\n${error.stack}`)).on("warn", error => console.log(`Warning:\n${error.stack}`));