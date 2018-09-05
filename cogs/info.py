from discord.ext import commands


def setup(bot):
    bot.add_cog(Info(bot))


class Info:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def info(self, ctx):
        await ctx.send(':information_source: **This bot is currently under beta!** Please report any issue!\n'
                       'You can get all commands and features by typing **`.help`**, '
                       'if you want to join my support server, type **`.support`**. '
                       'You can invite me by typing **`.invite`**')
