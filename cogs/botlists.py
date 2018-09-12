from threading import Timer


from main import Groovy


class DiscordLists:
    def __init__(self, bot: Groovy):
        self.bot = bot
        self.auth = {}
        self.start_loop()

    def start_loop(self):
        params = self.auth.copy()
        params['server_count'] = len(self.bot.guilds)
        params['bot_id'] = self.bot.user.id
        params['shard_count'] = self.bot.shard_count
        params['botsfordiscord.com'] = self.bot.get_config()['botlists']['bfd']
        params['botlist.space'] = self.bot.get_config()['botlists']['bls']
        params['discordbots.org'] = self.bot.get_config()['botlists']['dbl']
        params['discord.services'] = self.bot.get_config()['botlists']['discord.services']
        params['bots.discordlist.app'] = self.bot.get_config()['botlists']['discordlist.app']
        params['discordbots.group'] = self.bot.get_config()['botlists']['discordbots.group']
        params['discordbotlist.com'] = self.bot.get_config()['botlists']['discordlist.com']
        params['bots.ondiscord.xyz'] = self.bot.get_config()['botlists']['ondiscord.xyz']

        headers = {
            'Content-Type': 'application/json'
        }
        await self.bot.session.post('https://botblock.org/api/count', json=params, headers=headers)
        Timer(60.0, self.start_loop).start()


def setup(bot):
    if not bot.is_in_debug_mode():
        bot.add_cog(DiscordLists(bot))
