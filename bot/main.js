const Discord = require("discord.js");
const fs = require("fs");

const readdir = require("util").promisify(require("fs").readdir);

const { PlayerManager } = require("discord.js-lavalink");
const { MySql } = require("./util/mysqlConnection.js");

const Embed = require("./util/createEmbed.js");
const postServerCount = require("./util/postServerCount.js");
const voiceUpdate = require("./util/voiceUpdate.js");
const SetUp = require("./core/setUp.js");
const commandHandler = require("./core/commandHandler.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

var guilds = {};    
var token = config.TEST;
var prefix = config.PREFIX;

const nodes = [
    { host: config.HOST, port: config.PORT, region: "eu", password: config.PASS }
    //{ host: config.HOST2, port: config.PORT2, region: "eu", password: config.PASS2 }
];

class musicBotClient extends Discord.Client {
    constructor(options) {
        super(options);
        this.config = require("./json/config.json");
        this.embed = require("./util/createEmbed.js");
        this.playermanager = null;
        this.mysql = null;
    }
}

const Client = new musicBotClient({ messageCacheMaxSize: 50, messageCacheLifetime: 300, messageSweepInterval: 300, disabledEvents: ['TYPING_START'] });

const init = async () => {
    await Client.login(token).then(console.log("Successfully connected to Discord API"));
    Client.mysql = await new MySql(config.HOST, config.USER, config.PASS, config.DATABASE);
    Client.playermanager = await new PlayerManager(Client, nodes, {
        user: Client.user.id,
        shards: 1
    });
    Client.playermanager.nodes.get(config.HOST).on("disconnect", reason => {
        try {
            Client.playermanager.nodes.get(config.HOST).connect();            
        } catch (error) {
            console.log(error);
        }
    });
    await SetUp.run(Client);
    await postServerCount.run(Client.guilds.size);
    try {
        Client.on("guildCreate", guild => {
            const log_channel = Client.channels.get("411177077014790147");
            Embed.createEmbed(log_channel, `:white_check_mark: New guild joined: **${guild.name}** (id: ${guild.id}). This guild has **${guild.memberCount}** members!`, "Created");
            postServerCount.run(Client.guilds.size);
        });

        Client.on("guildDelete", guild => {
            const log_channel = Client.channels.get("411177077014790147");
            Embed.createEmbed(log_channel, `:no_entry: I have been removed from: **${guild.name}** (id: ${guild.id})`, "Removed");
            postServerCount.run(Client.guilds.size);

            try {    
                Client.mysql.executeQuery(`DELETE FROM guilds WHERE id = '${guild.id}'`);
            } catch (error) {
                console.log(error);
            }
        });

        const moduleFiles = await readdir("./bot/modules/");
        console.log(`Accessed a total of ${moduleFiles.length} modules.`);
        moduleFiles.forEach(file => {
            const moduleName = file.split(".")[0];
            console.log("Module \"" + moduleName + "\" loaded!");
            const module = require(`./modules/${file}`);
        });
    } catch (e) {
        console.error("Error in init function", e);
    }

    try {
        Client.on('message', msg => {
            commandHandler.run(Client, guilds, Embed, msg);
        });
    } catch (e) {
        console.error("Error in commandhandling function", e);
    }

    try {
        Client.on('voiceStateUpdate', (mold, mnew) => {
            if(!guilds[mold.guild.id]) return;
            voiceUpdate.run(Client, guilds, Embed, mold, mnew);
        });
    } catch (e) {
        console.error("Error in voiceStateUpdate function", e);
    }
};

init();

process.on("unhandledRejection", error => console.log(`unhandledRejection:\n${error.stack}`)).on("uncaughtException", error => console.log(`uncaughtException:\n${error.stack}`)).on("error", error => console.log(`Error:\n${error.stack}`)).on("warn", error => console.log(`Warning:\n${error.stack}`));