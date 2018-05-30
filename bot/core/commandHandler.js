const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = async (Client, msg) => {

    if(msg.channel.type == "dm" || msg.channel.type == "group") return;
    if(msg.author.bot == true) return;

    var guild = Client.servers.get(msg.guild.id);

    if(guild == null) await Client.functions.checkGuild(Client, msg.guild, config.PREFIX, msg.guild.me.displayColor);

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.isMemberMentioned(msg.guild.me)) {
        if(msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) {
            return Client.functions.createEmbed(msg.channel, texts.mentioned1 + guild.prefix + texts.mentioned2 + guild.prefix + texts.mentioned3, texts.mentioned_title);
        } else { return; }
    } 

    if(msg.channel.type == "text" && msg.content.startsWith(guild.prefix)) {
        if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES") || !msg.guild.me.permissionsIn(msg.channel).has("ADD_REACTIONS")) return;
    
        var invoke = msg.content.split(' ')[0].substr(guild.prefix.length);
        var args   = msg.content.split(' ').slice(1);
    
        var cmd = Client.commands.get(invoke);

        if(cmd) {
            Client.log.info("[Shard " + (Client.shard.id + 1) + "] [CommandHandler] \"" + invoke + "\" was executed by " + msg.author.username + "#" +  msg.author.discriminator + " on guild \"" + msg.guild.name + "\" (" + msg.guild.id + ")" + (invoke == "play" ? " - Queue now: " + (guild.queue.length + 1) : ""));
            if(guild.collector) {
                if(guild.collector.message) guild.collector.message.clearReactions();
                guild.collector.stop();
            }
            Client.executed++;
            try { await cmd.run(Client, msg, args, true); } catch(error) { console.log(error); }
        }
    }
}