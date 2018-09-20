from discord.ext import commands

from utilities import checks


class Skip:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @checks.dj_only()
    async def skip(self, ctx, *, to=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 | I\'m not playing.')

        skip_to = 0
        if to is not None:
            try:
                skip_to = int(to) - 1
            except ValueError:
                return await ctx.send('🚫 | Please specify a valid position to skip to!')

        if skip_to < 0:
            return await ctx.send('🚫 | Please specify a valid position to skip to!')

        if len(player.queue) < (skip_to + 1):
            player.queue.clear()
            await player.skip()
            return await ctx.send('✅ | There was no track at this position so I cleared the queue!')

        for x in range(0, skip_to):
            await player.skip()

        if to is None:
            await ctx.send('⏭ | Skipped.')
        else:
            await ctx.send(f'⏭ | Skipped to {to}.')


def setup(bot):
    bot.add_cog(Skip(bot))
