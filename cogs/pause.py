from discord.ext import commands


def setup(bot):
    bot.add_cog(Pause(bot))


class Pause:
    def __init__(self, bot):
        self.bot = bot

    @commands.command
    async def pause(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        if not player.paused:
            await player.set_pause(True)
            await ctx.send('⏯ | Paused')
        else:
            await ctx.send('🚫 I\'m already paused!')
