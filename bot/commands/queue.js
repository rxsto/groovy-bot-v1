const fs = require("fs");
const Discord = require("discord.js");

module.exports.run = async (Client, guilds, Embed, msg, args) => {
    
    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    if(guilds[msg.guild.id].queue.length == 0) return Embed.createEmbed(msg.channel, texts.queue_nothing, texts.error_title); 

    var page = 1;
    var pages = Math.ceil(guilds[msg.guild.id].queue.length / 10);
    var titles = [];

    var loading_emb = new Discord.RichEmbed().setColor(msg.guild.me.displayColor).setFooter("Loading...").setDescription("");

    guilds[msg.guild.id].queue.forEach(song => {
        titles.push(song.info.title);
    });

    const embed = new Discord.RichEmbed()
        .setColor(msg.guild.me.displayColor)
        .setFooter(`Page ${page} of ${pages}`)
        .setDescription(generateContent());
    
    msg.channel.send(embed).then(async message => {
    
        await message.react('⏪');
        await message.react('⏩');
        
        const backwardsFilter = (reaction, user) => reaction.emoji.name === '⏪' && user.id === msg.author.id;
        const forwardsFilter = (reaction, user) => reaction.emoji.name === '⏩' && user.id === msg.author.id; 
        
        const backwards = message.createReactionCollector(backwardsFilter, { time: 600000 });
        const forwards = message.createReactionCollector(forwardsFilter, { time: 600000 });
        
        backwards.on('collect', async r => {
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
        });
        
        forwards.on('collect', async r => {
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
        });    
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
            if(titles[i - 1]) content.push(`:white_small_square: **${i}:** ` + titles[i - 1]);
        }
        return content;
    }
}