from discord.ext import commands


def setup(bot):
    bot.add_cog(Temp(bot))


class Temp:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['rm'])
    async def remove(self, ctx, index: int):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not index:
            return await ctx.send('🚫 Please specify a position!')

        if not player.queue:
            return await ctx.send('🚫 There\'s nothing queued!')

        if index > len(player.queue) or index < 1:
            return await ctx.send('🚫 Index has to be >=1 and <=queue size')

        index -= 1
        removed = player.queue.pop(index)

        await ctx.send('Removed **' + removed.title + '** from the queue.')
