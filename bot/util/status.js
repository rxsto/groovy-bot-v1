const Discord = require("discord.js");
const superagent = require("superagent");
const fs = require("fs");
const colors = require("colors");

const config = JSON.parse(fs.readFileSync("./config.json", "utf8"));
const texts = JSON.parse(fs.readFileSync("./bot/json/lang/en.json", "utf8"));

const main = require("../../app.js");

var manager;

const url = require("url");
const path = require("path");

const express = require("express");
const app = express();

const dataDir = path.resolve(`${process.cwd()}${path.sep}status`);
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

app.use("/public", express.static(path.resolve(`${dataDir}${path.sep}public`)));

app.locals.domain = "groovybot.xyz";
  
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const renderTemplate = (getmanager, res, req, template, data = {}) => {
    const baseData = {
        manager: getmanager
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};

app.get("/status", (req, res) => {
    var manager = main.getManager();
    renderTemplate(manager, res, req, "index.ejs");
});

app.listen(3000);

info("[Init] Statuspage is listening on port 3000");

function info(content) {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    content.split('\n').forEach(s => {
        console.log(`[${time}] ` + colors.green(` ${'[ INFO ]'} `) + ` ${s}`);
        write_info(`[${time}] ` + ` ${'[ INFO ]'} ` + ` ${s}`);
    });
}

function write_info(text) {
    var time = new Date().toISOString().split("T")[0];

    fs.stat(`logs/Groovy_Info_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Groovy_Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Groovy_Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

module.exports.setManager = function(newmanager) {
    manager = newmanager;
    manager.status = new Discord.Collection();
}

module.exports.setState = function(shardid, state, manager) {
    var shard = {
        state: state,
        id: shardid,
    }

    if(manager.status.has(shardid)) {
        manager.status.get(shardid).state = state;
    } else {
        manager.status.set(shardid, shard);
    }
}