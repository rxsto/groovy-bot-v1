from discord.ext import commands


def setup(bot):
    bot.add_cog(Donate(bot))


class Donate:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def donate(self, ctx):
        await ctx.send(':information_source: **Hey there!** Thank you for **using Groovy**! '
                       'You\'re thinking about **donating**?'
                       '**That is amazing!** It would help us a lot if somebody could help us **paying** for Groovy\'s '
                       'server! https://groovybot.gq/donate')
