import discord
from discord.ext import commands

from utilities import cogs


def setup(bot):
    bot.remove_command('help')
    bot.add_cog(Help(bot))


class Help:
    def __init__(self, bot):
        self.bot = bot
        self.info_title = 'ℹ All info-commands'

        self.info_msg = '▫ **command** [alias1, alias2, ...] - `description`\n\n'

        for cog in cogs.info_cogs:
            aliases = ''
            if len(cog) is 3:
                aliases += f' [{cog[2]}]'

            self.info_msg += f'▫ **{cog[0]}**{aliases} - `{cog[1]}`\n'

        self.music_title = '🎶 All music-commands'

        self.music_msg = '▫ **command** [alias1, alias2, ...] - `description`\n\n'

        for cog in cogs.music_cogs:
            aliases = ''
            if len(cog) is 3:
                aliases += f' [{cog[2]}]'

            self.music_msg += f'▫ **{cog[0]}**{aliases} - `{cog[1]}`\n'

    @commands.command(aliases=['?'])
    async def help(self, ctx):
        info_embed = discord.Embed(
            title=self.info_title,
            description=self.info_msg,
            color=0x2C2F33
        )
        await ctx.send(embed=info_embed)

        music_embed = discord.Embed(
            title=self.music_title,
            description=self.music_msg,
            color=0x2C2F33
        )
        await ctx.send(embed=music_embed)
