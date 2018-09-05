import discord

from discord.ext import commands

from utilities import cogs
from utilities import logger


def setup(bot):
    bot.remove_command('help')
    bot.add_cog(Help(bot))


class Help:
    def __init__(self, bot):
        self.bot = bot
        self.title = ':information_source: All commands and features'

        self.msg = ':white_small_square: **command** [alias1, alias2, ...] - `description`\n\n'

        logger.info(f'Started generating help message ...')

        for cog in cogs.cogs:
            aliases = ''
            if len(cog) is 3:
                aliases += f' [{cog[2]}]'

            self.msg += f':white_small_square: **{cog[0]}**{aliases} - `{cog[1]}`\n'

    @commands.command(aliases=['?'])
    async def help(self, ctx):
        embed = discord.Embed(title=self.title, description=self.msg, color=ctx.guild.me.top_role.color)
        await ctx.send(embed=embed)
