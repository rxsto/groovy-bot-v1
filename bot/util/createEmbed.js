const { RichEmbed } = require('discord.js');

module.exports = {
    createEmbed(channel, content, title) {
        var message;
        var emb = new RichEmbed();
        
        emb.setDescription(content);
        emb.setColor(channel.guild.me.displayColor);
        if(title) {
            emb.setTitle(title)
        }
        channel.send('', emb).then((m) => {
            message = m
        });
        return message;
    }
}