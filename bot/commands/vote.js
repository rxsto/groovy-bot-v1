const fs = require("fs");
const DBL = require("dblapi.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

const dbl = new DBL(config.LIST_ORG);

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));
    
    Client.functions.createEmbed(msg.channel, texts.command_vote_text, texts.command_vote_title);
}