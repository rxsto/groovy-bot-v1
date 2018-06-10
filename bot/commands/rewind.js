const fs = require("fs");

module.exports.run = (Client, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_same_channel, texts.error_title);

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_dj + "`" + guild.djRole + "`!", texts.error_title);

    if(!args[0]) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_arguments, texts.error_title);
    if(args[1]) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_invalid_seek_position, texts.error_title);

    var content = args.join(" ");
    var position = content.split(":");
    var amount;
    var get = false;


    position.forEach(number => {
        if(isNaN(number)) get = true;
    });

    if(get == true) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_number, texts.error_title);

    if(position.length > 4 || position.length < 1) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_invalid_seek_position, texts.error_title);

    switch (position.length) {
        case 1:
        amount = position.join("");
        break;


        case 2:
        amount = (+position[0]) * 60 + (+position[1]);
        break;


        case 3:
        amount = (+position[0]) * 60 * 60 + (+position[1]) * 60 + (+position[2]);
        break;

    
        default:
        return;
    }

    const player = Client.playermanager.get(msg.guild.id);
    if (!player) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_player, texts.error_title);

    var use_process = parseInt(guild.process, 10);
    var use_amount = parseInt(amount, 10);
    var jumpto = (use_process - use_amount) * 1000;
    if(jumpto > guild.queue[0].info.length) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_number_to_big, texts.error_title);
    guild.process = jumpto / 1000;

    player.seek(jumpto);
    Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + texts.command_rewind_text + "`" + new Date(jumpto).toISOString().substr(11, 8) + "`!", texts.command_rewind_title);
}