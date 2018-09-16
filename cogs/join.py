from threading import Timer

from discord.ext import commands

from cogs.music import Music


def setup(bot):
    bot.add_cog(Join(bot))


class Join:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['j', 'summon'])
    async def join(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        player.store('channel', ctx.channel.id)
        check = await Music.check_connect(ctx, player)
        if check is not None:
            return
        await player.connect(ctx.author.voice.channel.id)
        await ctx.send(
            f'✅ | I joined the voicechannel **`{ctx.author.voice.channel.name}`**!')

        Timer(60 * 5, self.check_playing, [player]).start()

    def check_playing(self, player):
        if player.current is None and player.channel_id != '486765249488224277':
            self.bot.loop.create_task(player.disconnect())
