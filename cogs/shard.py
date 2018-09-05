from discord.ext import commands


def setup(bot):
    bot.add_cog(Shard(bot))


class Shard:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def shard(self, ctx):
        await ctx.send(f':information_source: You\'re on shard {self.bot.shard_id}')
