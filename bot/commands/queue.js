const fs = require("fs");
const { RichEmbed, ReactionCollector } = require('discord.js');

const reactions = {
    backwards: "⏪",
    forwards: "⏩",
}

module.exports.run = async (Client, Embed, msg, args) => {

    var guild = Client.servers.get(msg.guild.id);
    
    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guild.language + ".json", 'utf8'));

    if(guild.queue.length == 0) return Embed.createEmbed(msg.channel, texts.queue_nothing, texts.error_title);

    var page = 1;
    var pages = Math.ceil(guild.queue.length / 10);
    var titles = [];

    var loading_emb = new RichEmbed().setColor(msg.guild.me.displayColor).setTitle("Queue").setFooter("Loading...").setDescription("");

    guild.queue.forEach(song => {
        titles.push(song.info.title);
    });

    const embed = new RichEmbed()
        .setColor(msg.guild.me.displayColor)
        .setTitle("Queue")
        .setFooter(`Page ${page} of ${pages}`)
        .setDescription(generateContent());
    
    msg.channel.send(embed).then(async message => {
        var cache_message = message;

        if(!msg.guild.me.permissionsIn(msg.channel).has("ADD_REACTIONS")) return;

        await resetReactions(message);

        const reaction_filter = (reaction, user) => reaction.emoji.name === reactions.backwards || reaction.emoji.name === reactions.forwards && msg.guild.members.get(user.id).voiceChannel === msg.guild.me.voiceChannel;

        guild.collector = new ReactionCollector(message, reaction_filter, { time: 600000 });

        guild.collector.on("collect", async r => {
            switch(r.emoji.name) {
                case reactions.backwards:

                clearReaction(r);
                if (page === 1) return;
                page--;
                await message.edit(loading_emb).then(msg_time => {
                    setTimeout(async  () => {
                        await embed.setDescription(generateContent());
                        await embed.setFooter(`Page ${page} of ${pages}`);
                        await message.edit(embed);
                    }, 1000);
                });
                break;


                case reactions.forwards:

                clearReaction(r);
                if (page === pages) return;
                page++;
                await message.edit(loading_emb).then(msg_time => {
                    setTimeout(async  () => {
                        await embed.setDescription(generateContent());
                        await embed.setFooter(`Page ${page} of ${pages}`);
                        await message.edit(embed);
                    }, 1000);
                });
                break;

                default:
                return;
            }
        });

        setTimeout( () => {
            message.clearReactions();
        }, 600000);
    });

    function clearReaction(reaction) {
        reaction.fetchUsers().then((users) => {
            user_array = users.array();

            user_array.forEach(user => {
                if(user.id != msg.guild.me.user.id) {
                    reaction.remove(user);
                }
            });
        });
    }

    function generateContent() {
        var content = [];
        for (var i = page * 10 - 9; i <= page * 10; i++) {
            if(titles[i - 1]) content.push(`:white_small_square: **${i}:** ` + titles[i - 1] + " " + guild.queue[i - 1].info.member.user);
        }
        return content;
    }

    async function resetReactions(msg_to_reset) {
        var message_to_delete;
        msg_to_reset.channel.send(texts.np_setting_emojis).then((m) => {
            message_to_delete = m;
        });

        await msg_to_reset.clearReactions();
    
        await msg_to_reset.react('⏪');
        await msg_to_reset.react('⏩');

        await message_to_delete.delete();
    }
}