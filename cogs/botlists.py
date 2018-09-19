from threading import Timer

from utilities import logger


class DiscordLists:
    def __init__(self, bot):
        self.bot = bot
        self.auth = {}
        self.run_loop()

    async def start_loop(self):
        params = self.auth.copy()
        params['server_count'] = len(self.bot.guilds)
        params['bot_id'] = self.bot.user.id
        params['shard_count'] = self.bot.shard_count
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
        async with self.bot.session.post('https://botblock.org/api/count', json=params, headers=headers) as r:
            if r.status is not 200:
                logger.error(f'[STATS] Could not post stats: {await r.text()}')
        Timer(300, self.run_loop).start()

    def run_loop(self):
        self.bot.loop.create_task(self.start_loop())


def setup(bot):
    if not bot.is_in_debug_mode():
        bot.add_cog(DiscordLists(bot))
