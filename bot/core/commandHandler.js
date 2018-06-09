const fs = require("fs");
const colors = require('colors');

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = async (Client, msg) => {

    var guild = Client.servers.get(msg.guild.id);

    if(!guild) await Client.functions.checkGuild(Client, msg.guild, config.PREFIX, msg.guild.me.displayColor);

    var texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.channel.type == "text" && msg.content.startsWith(guild.prefix) || msg.content.startsWith('<@'+Client.user.id+'>') || msg.content.startsWith('<@!'+Client.user.id+'>')) {
        if(Client.functions.checkPermissions(Client, msg) == false) return;

        if(msg.isMemberMentioned(msg.guild.me)) return Client.functions.createEmbed(msg.channel, texts.mentioned + guild.prefix + "`", texts.mentioned_title);

        var invoke = msg.content.split(' ')[0].substr(guild.prefix.length);
        var args   = msg.content.split(' ').slice(1);
    
        var cmd = Client.commands.get(invoke);

        if(cmd) {
            Client.log.log_command(`[Shard ${Client.shard.id + 1}] [CommandHandler] ` + colors.green(`${msg.author.username}#${msg.author.discriminator}`) + " @ " + colors.blue(`${msg.guild.name} (${msg.guild.id})`) + " in " + colors.cyan(`#${msg.channel.name}`) + " » ".yellow + msg.content);
            Client.log.write_command(`[Shard ${Client.shard.id + 1}] [CommandHandler] ` + (`${msg.author.username}#${msg.author.discriminator}`) + " @ " + (`${msg.guild.name} (${msg.guild.id})`) + " in " + (`#${msg.channel.name}`) + " » " + msg.content)
            if(guild.collector) {
                if(guild.collector.message) guild.collector.message.clearReactions();
                guild.collector.stop();
            }
            Client.executed++;
            cmd.run(Client, msg, args, true);
        }
    }
}