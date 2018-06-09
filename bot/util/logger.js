const fs = require("fs");

exports.error = (content) => {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    content.split('\n').forEach(s => {
        console.log(`[${time}] `.white + ` ${'[ ERROR ]'} `.red + ` ${s}`);
        write_error(`[${time}] ` + ` ${'[ ERROR ]'} ` + ` ${s}`);
        write_full(`[${time}] ` + ` ${'[ ERROR ]'} ` + ` ${s}`);
    });
}

exports.info = (content) => {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    content.split('\n').forEach(s => {
        console.log(`[${time}] `.white + ` ${'[ INFO ]'} `.green + ` ${s}`);
        write_info(`[${time}] ` + ` ${'[ INFO ]'} ` + ` ${s}`);
        write_full(`[${time}] ` + ` ${'[ INFO ]'} ` + ` ${s}`);
    });
}

exports.command = (content) => {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    content.split('\n').forEach(s => {
        console.log(`[${time}] `.white + ` ${'[ COMMAND ]'} `.yellow + ` ${s}`);
        write_command(`[${time}] ` + ` ${'[ COMMAND ]'} ` + ` ${s}`);
        write_full(`[${time}] ` + ` ${'[ COMMAND ]'} ` + ` ${s}`);
    });
}

function write_error(text) {
    var time = new Date().toISOString().split("T")[0];

    fs.stat(`logs/Error_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Error_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Error_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

function write_info(text) {
    var time = new Date().toISOString().split("T")[0];

    fs.stat(`logs/Info_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Info_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

function write_command(text) {
    var time = new Date().toISOString().split("T")[0];

    fs.stat(`logs/Commands_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Commands_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Commands_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

function write_full(text) {
    var time = new Date().toISOString().split("T")[0];

    fs.stat(`logs/Groovy_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Groovy_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Groovy_${time}.txt`, `${text}\n`, (err) => {
                if (err) console.log(err);
            });
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}

exports.write_command = (text) => write_command();
exports.log_command = (text) => {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    console.log(`[${time}] `.white + ` ${'[ COMMAND ]'} `.yellow + ` ${text}`);
}