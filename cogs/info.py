from discord.ext import commands

from utilities import texts


def setup(bot):
    bot.add_cog(Info(bot))


class Info:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def info(self, ctx):
        await ctx.send(texts.info_text)
