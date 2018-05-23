const Discord = require("discord.js");
const fs = require("fs");

const checkDJ = require("../util/checkDJ.js");

module.exports.run = (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));    
    
    if(!args[0]) {
        Embed.createEmbed(msg.channel, texts.removed_no_args, texts.error_title);
    } else if(args[1]) {
        Embed.createEmbed(msg.channel, texts.removed_two_args, texts.error_title);
    } else {
        if(isNaN(args[0])) {
            if(msg.mentions.members.first().user.id != null) {
                var seen = new Discord.Collection();

                guild.queue.forEach(song => {
                    if(song.track == guild.queue[0].track) return seen.set(song.track, song);
                    if(msg.mentions.users.first().id != song.info.member.user.id) seen.set(song.track, song);
                });
            
                return guild.queue = seen.array();
                Embed.createEmbed(msg.channel, texts.remove_mention_text, texts.remove_mention_title);
            }
        } else {
            return Embed.createEmbed(msg.channel, texts.removed_no_number, texts.error_title);
        }
        if(args.join(" ") == 1) return Embed.createEmbed(msg.channel, texts.removed_first_number, texts.error_title);
        var pos = args - 1;
        if(guild.queue[pos]) {
            if(guild.queue[pos].info.member.user.id == msg.author.id) {
                guild.queue.splice(pos, 1);
                Embed.createEmbed(msg.channel, texts.removed_successfully + args + ".", texts.removed_title);
            } else {
                if(checkDJ.run(Embed, guild, msg) == false) return Embed.createEmbed(msg.channel, texts.no_dj + "`" + guild.djRole + "`!", texts.error_title);
                guild.queue.splice(pos, 1);
                Embed.createEmbed(msg.channel, texts.removed_successfully + args + ".", texts.removed_title);
            }
        } else {
            Embed.createEmbed(msg.channel, texts.removed_no_song, texts.error_title);
        }     
    }
}