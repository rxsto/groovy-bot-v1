const snekfetch = require("snekfetch");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync('./bot/json/config.json', 'utf8'));

exports.run = async (string) => {
    const res = await snekfetch.get(`http://localhost:2333/loadtracks`)
        .query({ identifier: string })
        .set("Authorization", config.PASS1)
        .catch(err => {
            console.error(err);
            return null;
        });
    if (!res) throw "There was an error, try again";
    if (!res.body.length) throw "No tracks found";
    return res.body;
}