import asyncio

import discord
from discord.ext import commands

from utilities import logger


def setup(bot):
    bot.add_cog(Shard(bot))


class Shard:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['shards'])
    async def shard(self, ctx):
        embed = discord.Embed(
            description=f'✅ **Shard {ctx.guild.shard_id + 1} online - '
                        f'{int(self.bot.latency * 1000)} ms**'
        )
        await ctx.send(embed=embed)
