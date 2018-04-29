const snekfetch = require('snekfetch');
const superagent = require('superagent');
const fs = require("fs");

const log = require("./logger.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

exports.run = async (server_count) => {

    const { body: { shards: totalShards } } = await superagent.get("https://discordapp.com/api/gateway/bot").set("Authorization",config.TOKEN);

    var post = {
        "shard_id": 1,
        "shard_count": totalShards,
        "server_count": server_count
    }

    snekfetch.post(`https://discordbots.org/api/bots/stats`)
        .set('Authorization', config.LIST_ORG)
        .send({
            "shard_count": totalShards,
            "server_count": server_count
        })
        .then()
        .catch(err => log.error("[PostServerCount] " + err));

    snekfetch.post("https://botlist.space/api/bots/402116404301660181")
        .set("Authorization", config.LIST_SPACE)
        .send({
            "shard_count": totalShards,
            "server_count": server_count
        })
        .then()
        .catch(err => log.error("[PostServerCount] " + err));

    snekfetch.post("https://bots.discord.pw/api/bots/402116404301660181/stats")
        .set("Authorization", config.LIST_PW)
        .send({
            "shard_count": totalShards,
            "server_count": server_count
        })
        .then()
        .catch(err => log.error("[PostServerCount] " + err));

    log.info("[PostServerCount] Successfully posted current server-count");
}