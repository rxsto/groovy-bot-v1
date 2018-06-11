const fs = require("fs");
const snekfetch = require("snekfetch");

module.exports.run = async (Client, msg, args) => {

    if(msg.author.id != "254892085000405004") return;

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(args[2]) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + "Usage: " + guild.prefix + "shards restart [id:id...]", "Error");

    if(!args[0]) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + "Usage: " + guild.prefix + "shards restart [id:id...]", "Error");

    console.log(args);

    if(args[0] == "restart") {
        if(!args[1]) {
            Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + "Successfully restarted all shards, please be patient!", "Restarted");
            setTimeout(() => {
                Client.shard.broadcastEval('this.functions.restart(this);');
            }, 2000);        
        } else {
            var shards = args[1].split(":");
            if(shards.length > 1) {
                Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + "Successfully restarted " + shards.length + " shards (" + shards.join(", ") +  "), please be patient!", "Restarted");
                setTimeout(() => {
                    for (let i = 0; i < shards.length; i++) {
                        Client.shard.broadcastEval(`this.functions.restart(this, ${shards[i]});`);
                    }
                }, 2000);
            } else {
                Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + "Successfully restarted shard " + shards[0] + ", please be patient!", "Restarted");
                setTimeout(() => {
                    Client.shard.broadcastEval(`this.functions.restart(this, ${shards[0]});`);
                }, 2000);            
            }
        }
    }
}