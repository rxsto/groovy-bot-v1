const Discord = require("discord.js");
const Dbl = require("dblapi.js");
const fs = require("fs");
const colors = require("colors");

const global = require("./global.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));
const texts = JSON.parse(fs.readFileSync("./bot/json/lang/en.json", "utf8"));

var manager;

const dbl = new Dbl(config.keys.dbl, { webhookPort: 1234, webhookAuth: config.passwords.dblwebhook });

dbl.webhook.on('ready', hook => {
    info(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
});

dbl.webhook.on('vote', vote => {
    if(!manager) {
        setTimeout( () => { manager.broadcastEval(`this.functions.upvote(this, "${vote.user}");`); }, 30000);
    } else {
        manager.broadcastEval(`this.functions.upvote(this, "${vote.user}");`);
    }

    global.msgUser(vote.user, texts.command_vote_success);

    setTimeout( () => {
        global.msgUser(vote.user, texts.command_vote_end);
    }, 3600000);
});

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

    fs.stat(`logs/Groovy_Info_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Groovy_Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Groovy_Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

module.exports.setManager = function(newmanager) {
    manager = newmanager;
}