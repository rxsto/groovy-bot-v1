from discord.ext import commands


def setup(bot):
    bot.add_cog(Vote(bot))


class Vote:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def vote(self, ctx):
        await ctx.send(':information_source: You want to upvote Groovy? **Check here:** https://groovybot.gq/vote')
