const fs = require("fs");

exports.error = (content) => {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    content.split('\n').forEach(s => {
        console.log(`[${time}] ${'[ ERROR ]'} ${s}`);
        write(`[${time}] ${'[ ERROR ]'} ${s}`);
    });
}

exports.info = (content) => {
    var first = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    var upgrade = first.split(":");

    upgrade[0] = parseInt(upgrade[0]) + 2;
    var time = upgrade.join(":");

    content.split('\n').forEach(s => {
        console.log(`[${time}] ${'[ INFO ]'} ${s}`);
        write(`[${time}] ${'[ INFO ]'} ${s}`);
    });
}

function write(text) {
    var time = new Date().toISOString().split("T")[0];

    fs.stat(`logs/Groovy_${time}.txt`, function(err, stat) {
        if(err == null) {
            fs.appendFile(`logs/Groovy_${time}.txt`, `${text}\n`, function (err) {
                if (err) console.log(err);
            }); 
        } else if(err.code == 'ENOENT') {
            fs.writeFile(`logs/Groovy_${time}.txt`, `${text}\n`);
        } else {
            console.log('Some other error: ', err.code);
        }
    });
}