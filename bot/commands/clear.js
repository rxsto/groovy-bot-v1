const fs = require("fs");

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, texts.general_same_channel, texts.error_title);

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, texts.general_no_dj + "`" + guild.djRole + "`!", texts.error_title);

    if(!guild.queue[0]) return Client.functions.createEmbed(msg.channel, texts.command_clear_queue_empty, texts.error_title);

    var first = guild.queue[0];

    guild.queue = []
    guild.queue.push(first);

    Client.functions.createEmbed(msg.channel, texts.command_clear_text, texts.command_clear_title);
}