from discord.ext import commands
from cogs.music import Music


def setup(bot):
    bot.add_cog(Temp(bot))


class Temp:
    def __init__(self, bot):
        self.bot = bot

    @commands.command
    async def stop(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        player.queue.clear()
        if player.current is not None:
            await Music.fade_out(player)
        await player.stop()
        await ctx.send('⏹ | Stopped.')
        if player.current is not None:
            await Music.fade_in(player)
