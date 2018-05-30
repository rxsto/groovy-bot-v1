const fs = require("fs");

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, texts.same_channel, texts.error_title);

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);

    const player = Client.playermanager.get(msg.guild.id);
    if (!player) return Client.functions.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);

    clearInterval(guild.interval);
    guild.process = 0;

    try {
        await player.play(guild.queue[0].track);
    } catch (error) {
        console.log(error);
    }

    Client.functions.createEmbed(msg.channel, texts.reset_text, texts.reset_title);
}