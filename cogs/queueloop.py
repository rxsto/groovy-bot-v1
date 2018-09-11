from discord.ext import commands
from lavalink import DefaultPlayer

from cogs.music import Music


class QueueLoopCommand:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(name='queueloop', aliases=['qloop'])
    async def queue_loop(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        check = await Music.check_connect(ctx, player)
        if check is not None:
            return
        enabled = await player.toggle_queue_loop
        if enabled:
            return await ctx.send(':repeat: Successfully enabled queueloop')
        else:
            await ctx.send(':repeat: Successfully disabled queueloop')


@property
async def toggle_queue_loop(player):
    queue_loop_status = player.fetch('queueloop')
    if queue_loop_status is None:
        queue_loop_status = False
    player.store('queueloop', not queue_loop_status)
    return queue_loop_status


def setup(bot):
    setattr(DefaultPlayer, "toggle_queue_loop", toggle_queue_loop)
    bot.add_cog(QueueLoopCommand(bot))
