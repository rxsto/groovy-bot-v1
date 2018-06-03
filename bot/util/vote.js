const Discord = require("discord.js");
const Dbl = require("dblapi.js");
const fs = require("fs");

const global = require("./global.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));
const texts = JSON.parse(fs.readFileSync("./bot/json/lang/en.json", "utf8"));

var manager;
var users = new Discord.Collection();

const dbl = new Dbl(config.keys.dbl, { webhookPort: 1234, webhookAuth: config.passwords.dblwebhook });

dbl.webhook.on('ready', hook => {
    console.log(`Webhook running at http://${hook.hostname}:${hook.port}${hook.path}`);
});

dbl.webhook.on('vote', vote => {
    if(!manager) {
        setTimeout( () => { manager.broadcastEval(`this.functions.upvote(this, "${vote.user}");`); }, 30000);
    } else {
        manager.broadcastEval(`this.functions.upvote(this, "${vote.user}");`);
    }

    global.msgUser(vote.user, texts.vote_success_text);

    setTimeout( () => {
        global.msgUser(vote.user, texts.vote_end);
    }, 3600000);
});

module.exports.setManager = function(newmanager) {
    manager = newmanager;
}