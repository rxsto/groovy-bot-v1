from discord.ext import commands
from lavalink import DefaultPlayer

from cogs.music import Music


def setup(bot):
    setattr(DefaultPlayer, "toggle_loop_queue", toggle_loop_queue)
    bot.add_cog(Loopqueue(bot))


class Loopqueue:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['lq', 'loopq'])
    async def loopqueue(self, ctx):
        return ctx.send('🚫 Currently under construction!')
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        check = await Music.check_connect(ctx, player)
        if check is not None:
            return

        await ctx.send('🔁 | Loopqueue ' + ('enabled' if await player.toggle_queue_loop else 'disabled'))


@property
async def toggle_loop_queue(player):
    loop_queue_status = player.fetch('loopqueue')
    if loop_queue_status is None:
        loop_queue_status = False
    player.store('loopqueue', not loop_queue_status)
    return loop_queue_status
