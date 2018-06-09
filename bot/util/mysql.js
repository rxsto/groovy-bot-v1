const MySqlMod = require('mysql');
const syncSQL = require('sync-mysql');
const fs = require('fs');
const log = require("./logger.js");

const config = JSON.parse(fs.readFileSync("./bot/json/config.json", "utf8"));

class MySql {
    constructor(host, user, database) {
        log.info("[MySQL] Initializing MySQL-Connection");

        this.con = MySqlMod.createConnection({
            host:     host,
            user:     user,
            password: config.GLOBAL_PASS,
            database: database,
            supportBigNumbers: true,
            bigNumberStrings: true,
        });

        this.scon = new syncSQL({
            host:     host,
            user:     user,
            password: config.GLOBAL_PASS,
            database: database,
        });

        this.connect({
            charset: 'utf8_general_ci'
        });
    }

    connect() {
        this.con.connect((err) => {
            if (err)
                log.info("[MySQL] Failed connecting to MySql database");
            else
                log.info("[MySQL] Successfully connected to MySql database");
        })  
    }

    get connection() {
        return this.con;
    }

    executeQuery(query) {
        if (this.connected === false)
            return log.error("[MySQL] You first need to connect to database");
        this.con.query(query, (err, result) => {
            if (err) throw err;
        });
    }

    executeQuery(query, values) {
        if (this.connected === false)
            return log.error("[MySQL] You first need to connect to database");
        if (!values instanceof Array)
            return log.error("[MySQL] Need values as Array");
        this.con.query(query, values, (err, result) => {
            if (err) throw err;
        });
    }

    executeSelect(query, values) {
        return this.scon.query(query, values);
    }

    executeSelect(query) {
        return this.scon.query(query);
    }
}

exports.MySql = MySql;