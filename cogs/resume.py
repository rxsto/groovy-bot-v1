from discord.ext import commands


def setup(bot):
    bot.add_cog(Resume(bot))


class Resume:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def resume(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 | I\'m not playing.')

        if player.paused:
            await player.set_pause(False)
            await ctx.send('▶ | Resumed')
        else:
            await ctx.send('🚫 | I\'m already resumed!')
