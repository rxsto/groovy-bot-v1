console.log(" _____                                   ");
console.log("|  __ \\                                  ");
console.log("| |  \\/ _ __   ___    ___  __   __ _   _ ");
console.log("| | __ | '__| / _ \\  / _ \\ \\ \\ / /| | | |");
console.log("| |_\\ \\| |   | (_) || (_) | \\ V / | |_| |");
console.log(" \\____/|_|    \\___/  \\___/   \\_/   \\__, |");
console.log("                                    __/ |");
console.log("                                   |___/ ");

const Discord = require('discord.js');
const superagent = require("superagent");
const fs = require("fs");
const colors = require("colors");

const vote = require("./bot/util/vote.js");
const global = require("./bot/util/global.js");
const status = require("./bot/util/status.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

const Manager = new Discord.ShardingManager('./bot/main.js');
Manager.token = config.Groovy.TOKEN;
Manager.status = new Discord.Collection();

module.exports.getManager = () => {
    return Manager;
}

info("Node.js Version: " + process.version + " - Discord.js Version: " + process.env.npm_package_dependencies_discord_js + " - System: " + process.arch + " " + process.platform);

async function init() {
    const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization", config.Groovy.TOKEN);

    for (let i = 0; i < totalShards; i++) {
        var shard = {
            state: "4",
            id: i,
        }
        Manager.status.set(i, shard);
    }

    require("./bot/util/vote.js");
    require("./bot/util/status.js");
    
    info("[ShardingManager] Starting to spawn " + totalShards + " shards!");
    
    Manager.spawn(totalShards, 5000);
    
    Manager.on("launch", shard => {
        info("[ShardingManager] Successfully launched shard " + (shard.id + 1));
        status.setState(shard.id, 4, Manager);
    });
    
    Manager.on("message", (shard, msg) => {
        switch(msg) {
            case "0":
            status.setState(shard.id, "0", Manager);
            break;

            case "1":
            status.setState(shard.id, "1", Manager);
            break;

            case "2":
            status.setState(shard.id, "2", Manager);
            break;

            case "3":
            status.setState(shard.id, "3", Manager);
            break;

            case "4":
            status.setState(shard.id, "4", Manager);
            break;

            case "5":
            status.setState(shard.id, "5", Manager);
            break;
        }
    });
    
    setTimeout( () => {
        vote.setManager(Manager);
        global.setManager(Manager);
        info("[ShardingManager] Successfully set all sub-manager!");
    }, Manager.totalShards * 5000);
}

init();

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

    fs.stat(`logs/Groovy_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Groovy_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Groovy_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}