module.exports = async (Client, error) => {
    Client.log.error("[Shard " + (Client.shard.id + 1) + "] [Core] " + error);
    Client.shard.send("1");
}