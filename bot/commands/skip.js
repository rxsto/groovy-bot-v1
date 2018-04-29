const fs = require("fs");

exports.run = (Client, guilds, Embed, msg, args, info) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(guilds[msg.guild.id].djMode) {
        if(!msg.member.roles.find("name", guilds[msg.guild.id].djRole)) {
            var array = msg.guild.me.voiceChannel.members.array();
            var members = array.length - 1;
            var votes = guilds[msg.guild.id].votes;

            var percentage = Math.round(votes / members);

            if(members == 1) {
                skip();
                return;
            }

            if(percentage >= 1) {
                skip();
            } else {
                guilds[msg.guild.id].votes = guilds[msg.guild.id].votes + 1;
                Embed.createEmbed(msg.channel, texts.skip_vote_text + "`" + guilds[msg.guild.id].votes + "`!", texts.skip_vote_title);
            }
        }
    } else {
        skip();
    }

    function skip() {
        guilds[msg.guild.id].votes = 0;
        const player = Client.playermanager.get(msg.guild.id);
        if (!player) return Embed.createEmbed(msg.channel, texts.audio_no_player, texts.error_title);
    
        if(args[0]) {
            if(args[1]) {                
                if(info) {
                    Embed.createEmbed(msg.channel, texts.skip_args, texts.error_title);
                }
            } else {
                var pos = args.join(" ");
                if(!isNaN(pos)) {
                    if(pos > guilds[msg.guild.id].queue.length) {                        
                        if(info) {
                            Embed.createEmbed(msg.channel, texts.skip_shorter, texts.error_title);
                        }
                    } else {
                        var remove = pos - 2; // because of 0,1,2,3
                        guilds[msg.guild.id].queue.splice(0, remove);
                        guilds[msg.guild.id].process = 0;
                        player.stop();
                        if(info) {
                            Embed.createEmbed(msg.channel, texts.skip_text + args + ".", texts.skip_title + args + "");
                        }
                    }
                } else {                    
                    if(info) {
                        Embed.createEmbed(msg.channel, texts.skip_no_number, texts.error_title);
                    }
                }
            }
        } else {
            if(!guilds[msg.guild.id].queue[1]) {                
                if(info) {
                    Embed.createEmbed(msg.channel, texts.skip_no_song, texts.error_title);
                }
            } else {
                player.stop();                
                if(info) {
                    Embed.createEmbed(msg.channel, texts.skip_single_text, texts.skip_single_title);
                }
            }
        }
    }
}