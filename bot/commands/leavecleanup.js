const Discord = require("discord.js");
const fs = require("fs");

module.exports.run = (Client, msg, args, info) => {

    var guild = Client.servers.get(msg.guild.id);

    var seen = new Discord.Collection();

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(msg.member.voiceChannel != msg.guild.me.voiceChannel) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_same_channel, texts.error_title);

    if(Client.functions.checkDJ(guild, msg) == false) return Client.functions.createEmbed(msg.channel, Client.emotes.get("error") + texts.general_no_dj + "`" + guild.djRole + "`!", texts.error_title);

    guild.queue.forEach(song => {
        if(song.track == guild.queue[0].track) return seen.set(song.track, song);
        if(msg.guild.me.voiceChannel.members.has(song.info.member.user.id)) seen.set(song.track, song);
    });

    guild.queue = seen.array();

    Client.functions.createEmbed(msg.channel, Client.emotes.get("check") + texts.command_leavecleanup_text, texts.command_leavecleanup_title);
}