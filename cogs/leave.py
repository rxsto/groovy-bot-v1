from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Leave(bot))


class Leave:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['exit', 'quit', 'l'])
    @checks.dj_only()
    async def leave(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_connected:
            return await ctx.send('🚫 | Not connected.')

        if not ctx.author.voice or (player.is_connected and ctx.author.voice.channel.id != int(player.channel_id)):
            return await ctx.send('🚫 | You\'re not in my voice channel!')

        if player.channel_id == '486765249488224277':
            return await ctx.send('🚫 | I have to stay in this channel!')

        player.queue.clear()
        await player.disconnect()
        return await ctx.send('*⃣ | Disconnected.')
