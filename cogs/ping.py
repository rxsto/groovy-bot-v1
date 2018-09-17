from discord.ext import commands


def setup(bot):
    bot.add_cog(Ping(bot))


class Ping:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def ping(self, ctx):
        await ctx.send(f'✅ | Hey, I\'m **online**! My current **average latency** is '
                       f'**{int(self.bot.latency * 1000)}**ms!')
