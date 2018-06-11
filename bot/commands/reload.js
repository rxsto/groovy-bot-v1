const fs = require("fs");
const snekfetch = require("snekfetch");

module.exports.run = async (Client, msg, args) => {

    if(msg.author.id != "254892085000405004") return;

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    Client.shard.broadcastEval('this.functions.reload(this);');

    Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + "Successfully reloaded all patrons!", "Reloaded");
}