const snekfetch = require("snekfetch");

exports.run = async (string, password) => {
    const res = await snekfetch.get(`http://localhost:2333/loadtracks`)
        .query({ identifier: string })
        .set("Authorization", password)
        .catch(err => {
            console.error(err);
            return null;
        });
    if (!res) throw "There was an error, try again";
    if (!res.body.length) throw "No tracks found";
    return res.body;
}