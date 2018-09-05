import dbl
import asyncio

from discord.ext import commands
from utilities import logger, config


class DiscordBotsHandler:

    def __init__(self, bot: commands.AutoShardedBot):
        self.bot = bot
        self.token = config.Config().get_config()['discordbots']['token']
        self.dblpy = dbl.Client(self.bot, self.token, loop=self.bot.loop)
        self.bot.loop.create_task(self.update_stats())

    async def update_stats(self):
        while True:
            try:
                await self.dblpy.post_server_count(shard_count=self.bot.shard_count)
            except IOError as e:
                logger.error(f'An error occurred while posting stats {type(e).__name__}')
            await asyncio.sleep(1800)


def setup(bot):
    bot.add_cog(DiscordBotsHandler(bot))
