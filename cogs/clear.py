from discord.ext import commands


def setup(bot):
    bot.add_cog(Clear(bot))


class Clear:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['cls', 'cl'])
    async def clear(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        player.queue.clear()
        await ctx.send('✅ Successfully cleared the queue!')
