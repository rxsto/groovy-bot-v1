from discord.ext import commands


def setup(bot):
    bot.add_cog(Support(bot))


class Support:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def support(self, ctx):
        await ctx.send(':information_source: You can join my support server here: https://groovybot.gq/support')
