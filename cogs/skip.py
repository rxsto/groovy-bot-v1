from discord.ext import commands
from cogs.music import Music


def setup(bot):
    bot.add_cog(Skip(bot))


class Skip:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def skip(self, ctx, *, to=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        await Music.fade_out(player)
        await ctx.send('⏭ | Skipped.')

        skip_to = 1
        if to is not None:
            try:
                skip_to = int(to) - 1
            except ValueError:
                await ctx.send('🚫 Please specify a valid position to skip to!')

        if skip_to < 1:
            return await ctx.send('🚫 Please specify a valid position to skip to!')

        if len(player.queue) < skip_to:
            player.queue.clear()
            await player.skip()
            return await ctx.send('✅ There was no track at this position so I cleared the queue!')

        if to is not None:
            for x in range(0, skip_to):
                player.queue.pop(x)

        await player.skip()
        await Music.fade_in(player)
