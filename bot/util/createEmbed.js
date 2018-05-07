const { RichEmbed } = require('discord.js');

module.exports = {

    createEmbed(channel, content, title) {
        var message;
        var emb = new RichEmbed();
        
        emb.setDescription(content);
        emb.setColor(channel.guild.me.displayColor);
        emb.setTitle(title)
        
        channel.send("", emb).then((m) => {
            message = m
        });

        random_emb();

        return message;
        
        function random_emb() {
            var vote_embed = new RichEmbed();
            vote_embed.setDescription(":mega: You want to get access to Patrons-only features? You can test them daily for 2 hours by upvoting Groovy! Check the vote command!");
            vote_embed.setColor(channel.guild.me.displayColor);
            vote_embed.setTitle("Patrons-only features! Vote up!");
    
            var check = Math.floor((Math.random() * 50) + 1);
    
            if(check == 42) channel.send("", vote_embed);
        }
    }
}