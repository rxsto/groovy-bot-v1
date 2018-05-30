const fs = require("fs");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(!msg.member.hasPermission("MANAGE_GUILD")) return Client.functions.createEmbed(msg.channel, texts.no_manage_permissions, texts.error_title);

    msg.channel.send(texts.reset_guild).then(async collected_message => {
        const message_filter = m => m.channel == msg.channel;
        guild.collector = await msg.channel.createMessageCollector(message_filter);

        guild.collector.on("collect", async m => {
            if(m.content == "RESET GUILD") {
                try {
                    await Client.playermanager.leave(msg.guild.id);
                    await Client.mysql.executeQuery(`DELETE FROM guilds WHERE id = '${msg.guild.id}'`);
                    await Client.functions.setGuild(Client, msg.guild, config.PREFIX, msg.guild.me.displayColor);
                    await collected_message.edit(texts.reset_success);
                    guild.collector.stop();
                } catch (error) {
                    console.log(error);
                }
            } else {
                await collected_message.edit(texts.error_text);
            }
        });
    });
}