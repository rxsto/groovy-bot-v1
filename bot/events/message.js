const commandHandler = require("../core/commandHandler.js");

module.exports = async (Client, msg) => {
    if(Client.useable == false) return;
    if(msg.channel.type != "text") return;
    if(msg.author.bot) return;
    if(Client.servers.has(msg.guild.id)) {
        if(msg.content.startsWith(Client.servers.get(msg.guild.id).prefix) || msg.content.startsWith('<@'+Client.user.id+'>') || msg.content.startsWith('<@!'+Client.user.id+'>')) {
            commandHandler.run(Client, msg);
        }
    } else {
        await Client.functions.checkGuild(Client, msg.guild, Client.prefix, msg.guild.me.displayColor);
        if(msg.guild.me.permissionsIn(msg.channel).has("USE_EXTERNAL_EMOJIS")) {
            msg.channel.send("<:check:449207827026673677> " + texts.general_init_guild).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 2500);
            });
        } else {
            msg.channel.send(":white_check_mark: " + texts.general_init_guild).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 2500);
            });
        }
    }
}