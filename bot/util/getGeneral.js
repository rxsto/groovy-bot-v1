const Long = require("long");

exports.run = (guild) => {
    return guild.channels.filter(c => c.type === "text" && c.permissionsFor(guild.client.user).has("SEND_MESSAGES")).sort((a, b) => a.position - b.position || Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber()).first();
}