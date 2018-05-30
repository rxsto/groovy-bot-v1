const fs = require("fs");

module.exports.run = (Client, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));  

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, texts.same_channel, texts.error_title);

    if(Client.functions.checkPatron(Client, guild, texts, msg, "2", true) == false) return;

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);

    if(guild.loopQueue) {
        guild.loopQueue = false;
        if(info) {
            Client.functions.createEmbed(msg.channel, texts.loopqueue_deactivated_text, texts.loopqueue_deactivated_title);
        }
    } else {
        guild.loopQueue = true;
        if(info) {
            Client.functions.createEmbed(msg.channel, texts.loopqueue_activated_text, texts.loopqueue_activated_title);            
        }
    }
}