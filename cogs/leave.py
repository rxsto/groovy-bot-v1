from discord.ext import commands
from cogs.music import Music


def setup(bot):
    bot.add_cog(Leave(bot))


class Leave:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['exit', 'quit', 'l'])
    async def leave(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_connected:
            return await ctx.send('🚫 Not connected.')

        if not ctx.author.voice or (player.is_connected and ctx.author.voice.channel.id != int(player.channel_id)):
            return await ctx.send('🚫 You\'re not in my voice channel!')

        if player.channel_id == '486765249488224277':
            return await ctx.send('🚫 I have to stay in this channel!')

        player.queue.clear()
        if player.current is not None:
            await Music.fade_out(player)
        await player.disconnect()
        await ctx.send('*⃣ | Disconnected.')
        await Music.fade_in(player)
