from discord.ext import commands


def setup(bot):
    bot.add_cog(Info(bot))


class Info:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def info(self, ctx):
        prefix = await self.bot.retrieve_prefix(ctx.guild.id)
        await ctx.send(':information_source: **This bot is currently under beta!** Please report any issue!\n'
                       f'You can get all commands and features by typing **`{prefix}help`**, '
                       f'if you want to join my support server, type **`{prefix}support`**. '
                       f'You can invite me by typing **`{prefix}invite`**')
