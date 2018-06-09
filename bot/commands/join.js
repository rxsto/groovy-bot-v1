const fs = require("fs");

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    var vc = msg.member.voiceChannel;

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, texts.general_no_dj + "`" + guild.djRole + "`!", texts.error_title);

    if(vc == msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, texts.command_join_is_already_vc, texts.error_title);

    if(!vc) return Client.functions.createEmbed(msg.channel, texts.general_not_in_channel, texts.error_title);

    if (!vc.joinable) {
        return Client.functions.createEmbed(msg.channel, texts.general_no_perms_connect, texts.error_title);
    } else if (!vc.speakable) {
        return Client.functions.createEmbed(msg.channel, texts.general_no_perms_speak, texts.error_title);
    }
    
    const player = await Client.playermanager.join({
        guild: msg.guild.id,
        channel: msg.member.voiceChannelID,
        host: "127.0.0.1"
    });

    guild.check = setInterval(async function() {
        var users = 0;
        if(!msg.guild.me || !msg.guild.me.voiceChannel) return clearInterval(guild.check);
        var members = msg.guild.me.voiceChannel.members.array();

        await members.forEach(member => {
            if(!member.user.bot) users++;
        });

        if(users == 0) {
            if(guild.isPaused) {
                if(msg.guild.id != "403882830225997825") {
                    Client.playermanager.leave(msg.guild.id);
                    clearInterval(guild.interval);
                    guild.queue = [];
                    guild.previous = null;
                    guild.votes.clear();
                    guild.process = 0;
                    guild.isPaused = false;
                    guild.isPlaying = false;
                }
            } else {
                const player = Client.playermanager.get(msg.guild.id);
                if (!player) return;
                await player.pause(true);
                guild.isPaused = true;
                clearInterval(guild.interval);
            }
        }
    }, 600000);

    Client.functions.createEmbed(msg.channel, texts.command_join_text, texts.command_join_text);
}