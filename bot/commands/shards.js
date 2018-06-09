const fs = require("fs");
const snekfetch = require("snekfetch");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

module.exports.run = async (Client, msg, args) => {

    if(msg.author.id != "254892085000405004") return;

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(args[1]) return Client.functions.createEmbed(msg.channel, ":x: Error! Usage: " + guild.prefix + " restart [id:id:id...]", "Error");

    if(!args[0]) {
        Client.shard.broadcastEval('this.functions.restart(this);');
        Client.functions.createEmbed(msg.channel, "<:check:449207827026673677> Successfully restarted all shards, please be patient!", "Restarted");
    } else {
        var shards = args.split(":");
        if(shards.length > 1) {
            for (let i = 0; index < shards.length; i++) {
                Client.shard.broadcastEval(`this.functions.restart(this, ${shards[i]});`);
            }
            Client.functions.createEmbed(msg.channel, "<:check:449207827026673677> Successfully restarted " + shards.length + " shards (" + shards.join(", ") +  "), please be patient!", "Restarted");
        } else {
            Client.shard.broadcastEval(`this.functions.restart(this, ${shards[0]});`);
            Client.functions.createEmbed(msg.channel, "<:check:449207827026673677> Successfully restarted shard " + shards[0] + ", please be patient!", "Restarted");
        }
    }
}