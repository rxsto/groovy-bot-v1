from discord.ext import commands


def setup(bot):
    bot.add_cog(Sponsor(bot))


class Sponsor:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def sponsor(self, ctx):
        await ctx.send(':information_source: | **This bot is sponsored by https://deinserverhost.de/ - '
                       'Check them out: https://groovybot.gq/sponsor **')
