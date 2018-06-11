const fs = require("fs");

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(!msg.member.hasPermission("MANAGE_GUILD")) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_missing_manage_guild_permission, texts.error_title);

    msg.channel.send(texts.command_reset_guild).then(async collected_message => {
        const message_filter = m => m.channel == msg.channel;
        guild.collector = await msg.channel.createMessageCollector(message_filter);

        guild.collector.on("collect", async m => {
            if(m.content == "RESET GUILD") {
                try {
                    await Client.playermanager.leave(msg.guild.id);
                    await Client.mysql.executeQuery(`DELETE FROM guilds WHERE id = '${msg.guild.id}'`);
                    await Client.functions.setGuild(Client, msg.guild, Client.prefix, msg.guild.me.displayColor);
                    await collected_message.edit(Client.emotes.get("warning") + texts.command_reset_text);
                    guild.collector.stop();
                } catch (error) {
                    console.log(error);
                }
            } else {
                await collected_message.edit(Client.emotes.get("error") + texts.command_reset_cancel);
                guild.collector.stop();
            }
        });
    });
}