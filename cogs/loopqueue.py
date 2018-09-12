from discord.ext import commands
from lavalink import DefaultPlayer

from cogs.music import Music


class Loopqueue:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='loopqueue', aliases=['lq', 'lqueue', 'loopq'])
    async def loopqueue(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        check = await Music.check_connect(ctx, player)
        if check is not None:
            return
        enabled = await player.toggle_loop_queue
        if enabled:
            return await ctx.send(':repeat: Successfully enabled loopqueue')
        else:
            await ctx.send(':repeat: Successfully disabled loopqueue')


@property
async def toggle_loop_queue(player):
    loop_queue_status = await player.loop_queue
    player.delete('loopqueue')
    player.store('loopqueue', not loop_queue_status)
    return await player.loop_queue


@property
async def get_loop_queue(player):
    loop_queue_status = player.fetch('loopqueue')
    if loop_queue_status is None:
        return False
    return loop_queue_status


def setup(bot):
    setattr(DefaultPlayer, 'toggle_loop_queue', toggle_loop_queue)
    setattr(DefaultPlayer, 'loop_queue', get_loop_queue)
    bot.add_cog(Loopqueue(bot))
