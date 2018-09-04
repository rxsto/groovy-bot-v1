from discord.ext import commands

from utilities import texts


def setup(bot):
    bot.remove_command('help')
    bot.add_cog(Help(bot))


class Help:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['?'])
    async def help(self, ctx):
        await ctx.send(texts.help_text)
