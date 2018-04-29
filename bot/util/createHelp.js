const fs = require("fs");

exports.run = (help, guilds, msg) => {

    texts = JSON.parse(fs.readFileSync( "./bot/json/lang/" + guilds[msg.guild.id].language + ".json", 'utf8'));

    var prefix = guilds[msg.guild.id].prefix;

    help.push("▫️ `" + prefix + "play` - " + texts.help_play);
    help.push("▫️ `" + prefix + "pause` - " + texts.help_pause);
    help.push("▫️ `" + prefix + "resume` - " + texts.help_resume);
    help.push("▫️ `" + prefix + "loop` - " + texts.help_loop);
    help.push("▫️ `" + prefix + "loopqueue` - " + texts.help_loopqueue);
    help.push("▫️ `" + prefix + "move <pos1 pos2>` - " + texts.help_move);
    help.push("▫️ `" + prefix + "reset` - " + texts.help_reset);
    help.push("▫️ `" + prefix + "shuffle` - " + texts.help_shuffle);
    help.push("▫️ `" + prefix + "np` - " + texts.help_np);
    help.push("▫️ `" + prefix + "queue` - " + texts.help_queue);
    help.push("▫️ `" + prefix + "skip` - " + texts.skip);
    help.push("▫️ `" + prefix + "seek <hh:mm:ss>` - " + texts.help_seek);
    help.push("▫️ `" + prefix + "remove` - " + texts.help_remove);
    help.push("▫️ `" + prefix + "stop` - " + texts.help_stop);
    help.push("▫️ `" + prefix + "leave` - " + texts.help_leave);
    help.push("▫️ `" + prefix + "help` - " + texts.help_help);
    help.push("▫️ `" + prefix + "info` - " + texts.help_info);
    help.push("▫️ `" + prefix + "support` - " + texts.help_support);
    help.push("▫️ `" + prefix + "donate` - " + texts.help_donate);
    help.push("▫️ `" + prefix + "vote` - " + texts.help_vote);
    help.push("▫️ `" + prefix + "invite` - " + texts.help_invite);
    help.push("▫️ `" + prefix + "stats` - " + texts.help_stats);
    help.push("▫️ `" + prefix + "settings` - " + texts.help_settings);
    help.push("▫️ `" + prefix + "set [setting] [value]` - " + texts.help_set);
}