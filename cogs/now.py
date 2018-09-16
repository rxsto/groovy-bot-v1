import discord
from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Now(bot))


class Now:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['np'])
    async def now(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        current = player.current

        embed = discord.Embed(
            title=f'🎶 {current.title}',
            url=current.uri,
            color=0x2C2F33
        ).set_thumbnail(url=current.thumbnail) \
            .add_field(name='Author', value=f'**{current.author}**') \
            .add_field(name='Requester', value=self.bot.get_user(current.requester).mention)

        await ctx.send(embed=embed)
