const fs = require("fs");

module.exports.run = async (Client, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_dj + "`" + guild.djRole + "`!", texts.error_title);
    
    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_same_channel, texts.error_title);

    if(msg.member.voiceChannel == msg.guild.me.voiceChannel) {
        const player = await Client.playermanager.get(msg.guild.id);
        if (!player) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_player, texts.error_title);
        guild.queue = [];
        guild.previous = null;
        await guild.votes.clear();
        guild.process = 0;
        guild.isPaused = false;
        guild.isPlaying = false;
        clearInterval(guild.interval);
        await player.stop();
        if(info) {
            Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + texts.stop_text, texts.stop_title);
        }
    } else {
        if(msg.guild.me.voiceChannel == null) {
            const player = await Client.playermanager.get(msg.guild.id);
            if (!player) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_player, texts.error_title);
            guild.queue = [];
            guild.previous = null;
            await guild.votes.clear();
            guild.process = 0;
            guild.isPaused = false;
            guild.isPlaying = false;
            clearInterval(guild.interval);
            await player.stop();
            if(info) {
                Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + texts.command_stop_text, texts.command_stop_title);
            }
        } else {
            Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_same_channel, texts.error_title);
        }
    }
}