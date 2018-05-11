const fs = require("fs");

const checkGuild = require("../util/checkGuild.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = async (Client, guilds, Embed, msg) => {

    if(!msg.channel.type == "text") return;
    if(msg.author.bot) return;
    
    if(!guilds[msg.guild.id]) {
        await checkGuild.run(Client, guilds, msg.guild, config.PREFIX, msg.guild.me.displayColor);
    }

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(msg.isMentioned(Client.user)) return Embed.createEmbed(msg.channel, texts.mentioned1 + guilds[msg.guild.id].prefix + texts.mentioned2 + guilds[msg.guild.id].prefix + texts.mentioned3, texts.mentioned_title);

    if(msg.channel.type == "text" && msg.content.startsWith(guilds[msg.guild.id].prefix)) {

        if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) return;
    
        var invoke = msg.content.split(' ')[0].substr(guilds[msg.guild.id].prefix.length);
        var args   = msg.content.split(' ').slice(1);
    
        var cmd = Client.commands.get(invoke);
    
        if(cmd) {
            Client.log.info("[CommandHandler] \"" + invoke + "\" was executed by " + msg.author.username + "#" +  msg.author.discriminator + " on guild " + msg.guild.name + " (" + msg.guild.id + ") " + (invoke == "play" ? "- Queue: " + guilds[msg.guild.id].queue.length : ""));
            cmd.run(Client, guilds, Embed, msg, args, true);
        }
    }
}