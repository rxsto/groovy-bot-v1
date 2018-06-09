const fs = require("fs");

module.exports.run = async (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, texts.general_same_channel, texts.error_title);

    if(Client.functions.checkPatron(Client, guild, texts, msg, "0", true) == false) return;

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, texts.general_no_dj + "`" + guild.djRole + "`!", texts.error_title);

    if(!args[0] || args[1]) {
        Client.functions.createEmbed(msg.channel, texts.command_volume_check_args, texts.error_title);
    } else if(!isNaN(args.join("")) && args >= 1 && args <= 100) {
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Client.functions.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);

        player.volume(parseInt(args[0]));

        Client.functions.createEmbed(msg.channel, texts.command_volume_text + " " +  args + " %.", texts.command_volume_title);
    } else {
        Client.functions.createEmbed(msg.channel, texts.command_volume_error, texts.error_title);
    }
}