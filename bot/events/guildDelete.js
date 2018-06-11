module.exports = async (Client, guild) => {
    Client.log.info(`[Shard ${(Client.shard.id + 1)}] [GuildHandler] Removed from: ${guild.name} (id: ${guild.id}) with ${guild.memberCount} members!`);
    var guildlog = Client.functions.returnEmbed(`:no_entry: [Shard ${(Client.shard.id + 1)}] I have been removed from: **${guild.name}** (id: ${guild.id})`, "Removed");
    Client.webhook.send({ embeds: [guildlog] });
    if(Client.debug == false) Client.functions.postcount(Client);

    try {    
        Client.mysql.executeQuery(`DELETE FROM guilds WHERE id = '${guild.id}'`);
    } catch (error) {
        Client.log.error(`[Shard ${(Client.shard.id + 1)}] [Core] ` + error);
    }

    var server = Client.servers.get(guild.id);
    if(server == null) return;

    Client.playermanager.leave(guild.id);
    clearInterval(server.interval);
    server.queue = [];
    server.previous = null;
    server.votes.clear();
    server.process = 0;
    server.isPaused = false;
    server.isPlaying = false;

    guild.owner.send(texts.general_left_text);
}