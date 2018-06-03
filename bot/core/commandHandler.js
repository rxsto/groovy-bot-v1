const fs = require("fs");
const colors = require('colors');

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = async (Client, msg) => {

    if(msg.channel.type == "dm" || msg.channel.type == "group") return;
    if(msg.author.bot == true) return;

    var guild = Client.servers.get(msg.guild.id);

    if(guild == null || !guild || guild == "undefined") {
        await Client.functions.checkGuild(Client, msg.guild, config.PREFIX, msg.guild.me.displayColor);
    }

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));
    if(msg.isMemberMentioned(msg.guild.me)) {
        if(msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES")) {
            return Client.functions.createEmbed(msg.channel, texts.mentioned1 + guild.prefix + texts.mentioned2 + guild.prefix + texts.mentioned3, texts.mentioned_title);
        } else { return; }
    } 

    if(msg.channel.type == "text" && msg.content.startsWith(guild.prefix)) {
        if(!msg.guild.me.permissionsIn(msg.channel).has("SEND_MESSAGES") || !msg.guild.me.permissionsIn(msg.channel).has("ADD_REACTIONS")) return msg.author.send(":x: I am not allowed to write messages or add reactions in this channel! Please check my permissions!");
    
        var invoke = msg.content.split(' ')[0].substr(guild.prefix.length);
        var args   = msg.content.split(' ').slice(1);
    
        var cmd = Client.commands.get(invoke);

        if(cmd) {
            Client.log.command(`[Shard ${Client.shard.id}] [CommandHandler] ` + colors.green(`${msg.author.username}#${msg.author.discriminator}`) + " @ " + colors.blue(`${msg.guild.name} (${msg.guild.id})`) + " in " + colors.cyan(`#${msg.channel.name}`) + " » ".yellow + msg.content);
            if(guild.collector) {
                if(guild.collector.message) guild.collector.message.clearReactions();
                guild.collector.stop();
            }
            Client.executed++;
            try { cmd.run(Client, msg, args, true); } catch(error) { console.log(error); }
        }
    }
}