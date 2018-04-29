const MySqlMod = require('mysql');
const syncSQL = require('sync-mysql');
const fs = require('fs');
const log = require("./logger.js");

class MySql {
    constructor(host, user, password, database) {

        this.con = MySqlMod.createConnection({
            host:     host,
            user:     user,
            password: password,
            database: database
        });

        this.scon = new syncSQL({
            host:     host,
            user:     user,
            password: password,
            database: database
        });

        this.connect({
            charset: 'utf8mb4'
        });
    }

    connect() {
        this.con.connect((err) => {
            if (err)
                log.error("[MySQL] Failed connecting to MySql database");
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