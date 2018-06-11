const debug = true;

const Discord = require("discord.js");
const fs = require("fs");

const logger = require("./util/logger.js");

const setupHandler = require("./core/setupHandler.js");

const texts = JSON.parse(fs.readFileSync("./bot/json/lang/en.json", "utf8"));

class Groovy extends Discord.Client {
    constructor(options) {
        super(options);
        this.useable = true;
        this.debug = debug;
        this.functions = require("./util/functions.js");
        this.log = require("./util/logger.js");
        this.config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
        this.prefix = (debug ? "gt!" : "g!");
        this.commands = new Discord.Collection();
        this.servers = new Discord.Collection();
        this.patrons = new Discord.Collection();
        this.voted = new Discord.Collection();
        this.emotes = new Discord.Collection();
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
    
    await Client.login((debug == true ? Client.config.Test.TOKEN : Client.config.Groovy.TOKEN)).then(logger.info("[Core] Successfully connected to Discord API"));
    await setupHandler.run(Client, await Client.guilds.array(), debug, (debug == true ? Client.config.Test.TOKEN : Client.config.Groovy.TOKEN));
};

init();

process.on("unhandledRejection", error => logger.error(`[Shard ${(Client.shard.id + 1)}] unhandledRejection:\n${error.stack}`)).on("uncaughtException", error => logger.error(`[Shard ${(Client.shard.id + 1)}] uncaughtException:\n${error.stack}`)).on("error", error => logger.error(`[Shard ${(Client.shard.id + 1)}] Error:\n${error.stack}`)).on("warn", error => logger.error(`[Shard ${(Client.shard.id + 1)}] Warning:\n${error.stack}`));