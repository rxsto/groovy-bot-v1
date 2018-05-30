const Discord = require('discord.js');
const superagent = require("superagent");
const fs = require("fs");

const { info } = require("./bot/util/logger.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

const Manager = new Discord.ShardingManager('./bot/main.js');
Manager.token = config.Groovy.TOKEN;

console.log(" _____                                   ");
console.log("|  __ \\                                  ");
console.log("| |  \\/ _ __   ___    ___  __   __ _   _ ");
console.log("| | __ | '__| / _ \\  / _ \\ \\ \\ / /| | | |");
console.log("| |_\\ \\| |   | (_) || (_) | \\ V / | |_| |");
console.log(" \\____/|_|    \\___/  \\___/   \\_/   \\__, |");
console.log("                                    __/ |");
console.log("                                   |___/ ");
console.log("Node.js Version: " + process.version + " - Discord.js Version: " + process.env.npm_package_dependencies_discord_js + " - System: " + process.arch + " " + process.platform);

Manager.spawn();

Manager.on("launch", shard => {
    info("[ShardManager] Successfully launched shard " + (shard.id + 1));
});