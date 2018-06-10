const fs = require("fs");

const play = require("./play.js");

module.exports.run = async (Client, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(guild.previous == null) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.command_previous_error, texts.error_title);

    const player = Client.playermanager.get(msg.guild.id);
    if (!player) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_player, texts.error_title);

    guild.queue.unshift(guild.previous);
    guild.queue.unshift(guild.previous);

    guild.previous = null;

    await player.stop();

    Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + texts.command_previous_text, texts.command_previous_title);
}