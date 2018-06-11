module.exports = async (Client, guild) => {
    Client.log.info(`[Shard ${(Client.shard.id + 1)}] [GuildHandler] New guild joined: ${guild.name} (id: ${guild.id}) with ${guild.memberCount} members!`);
    var guildlog = Client.functions.returnEmbed(`:white_check_mark: [Shard ${(Client.shard.id + 1)}] New guild joined: **${guild.name}** (id: ${guild.id}). This guild has **${guild.memberCount}** members!`, "Joined");
    Client.webhook.send({ embeds: [guildlog] });
    if(debug == false) Client.functions.postcount(Client);

    try {
        Client.functions.setGuild(Client, guild, Client.prefix, guild.me.displayColor);
    } catch (error) {
        Client.log.error("[Shard " + (Client.shard.id + 1) + "] [Core] " + error);
    }

    var channel = guild.channels
    .filter(c => c.type === "text" &&
        c.permissionsFor(guild.me).has("SEND_MESSAGES"))
    .sort((a, b) => a.position - b.position ||
        Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
    .first();

    if(channel == null) return;
    if(!guild.me.permissionsIn(channel).has("SEND_MESSAGES")) return;

    Client.functions.createEmbed(channel, texts.general_first_join_text, texts.general_first_join_title);
}