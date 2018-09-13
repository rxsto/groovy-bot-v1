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
        # Let's create a sick animation!

        embed = discord.Embed(
            title=f'Shards - Loading',
            description='<a:groovyloading:487681291010179072> Please wait while we fetch all shards ...'
        )

        message = await ctx.send(embed=embed)

        await asyncio.sleep(1.5)

        """if self.bot.shard_ids is None:
            embed = discord.Embed(
                description=f'<:check:449207827026673677> Shard 1 online - {int(self.bot.latency * 1000)} ms'
            )
            return await message.edit(embed=embed)"""

        try:
            for shard in range(0, len(self.bot.shard_ids)):
                await self.update_shards_message(message, shard)
                await asyncio.sleep(1)
        except ValueError:
            return logger.error('Error while creating shards message!')

    async def update_shards_message(self, message, stage):

        new_desc = ''

        for shard in range(0, (len(self.bot.shard_ids))):
            if shard <= stage:
                design = '**' if message.guild.shard_id == shard else ''
                new_desc += f'<:check:449207827026673677> {design}Shard {shard + 1} online - ' \
                            f'{int(self.bot.latencies[shard][1] * 1000)} ms{design} \n'
            else:
                new_desc += f'<a:groovyloading:487681291010179072> Shard {shard + 1} fetching ...\n'

        new_embed = discord.Embed(
            title=f'Shards - {len(self.bot.shard_ids)}',
            description=new_desc
        )

        await message.edit(embed=new_embed)
