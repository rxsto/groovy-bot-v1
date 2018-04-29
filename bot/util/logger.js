exports.error = (content) => {
    var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    content.split('\n').forEach(s => {
        console.log(`[${time}] ${'[ ERROR ]'} ${s}`);
    });
}

exports.info = (content) => {
    var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '').split(" ")[1];
    content.split('\n').forEach(s => {
        console.log(`[${time}] ${'[ INFO ]'} ${s}`);
    });
}