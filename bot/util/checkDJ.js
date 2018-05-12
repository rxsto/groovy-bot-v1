exports.run = (Embed, guild, msg) => {
    if(guild.djMode) {
        if(msg.member.hasPermission("KICK_MEMBERS", false, true, true)) return true;
        if(!msg.member.roles.find("name", guild.djRole)) {
            return false;
        } else {
            return true;
        }
    }
}