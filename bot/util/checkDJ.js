exports.run = (Embed, guilds, msg) => {
    if(guilds[msg.guild.id].djMode) {
        if(!msg.member.roles.find("name", guilds[msg.guild.id].djRole)) {
            return false;
        } else {
            return true;
        }
    }
}