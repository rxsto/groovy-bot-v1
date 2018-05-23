const fs = require("fs");

const checkGuild = require("../util/checkGuild.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = async (Client, Embed, msg) => {

    if(msg.channel.type == "dm" || msg.channel.type == "group") return;
    if(msg.author.bot === true) return;

    var guild = Client.servers.get(msg.guild.id);

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.isMentioned(Client.user)) {
        if(msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) {
            return Embed.createEmbed(msg.channel, texts.mentioned1 + guild.prefix + texts.mentioned2 + guild.prefix + texts.mentioned3, texts.mentioned_title);
        } else { return; }
    } 

    if(msg.channel.type == "text" && msg.content.startsWith(guild.prefix)) {

        if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) return;
    
        var invoke = msg.content.split(' ')[0].substr(guild.prefix.length);
        var args   = msg.content.split(' ').slice(1);
    
        var cmd = Client.commands.get(invoke);
    
        if(cmd) {
            Client.log.info("[CommandHandler] \"" + invoke + "\" was executed by " + msg.author.username + "#" +  msg.author.discriminator + " on guild \"" + msg.guild.name + "\" (" + msg.guild.id + ") " + (invoke == "play" ? "- Queue: " + guild.queue.length : ""));
            if(guild.collector) {
                if(guild.collector.message) guild.collector.message.clearReactions();
                guild.collector.stop();
            }
            try { await cmd.run(Client, Embed, msg, args, true); } catch(error) { console.log(error); }
        }
    }
}