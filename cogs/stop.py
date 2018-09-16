from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Temp(bot))


class Temp:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @checks.dj_only()
    async def stop(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 | I\'m not playing.')

        player.queue.clear()
        await player.stop()
        await ctx.send('⏹ | Stopped.')
