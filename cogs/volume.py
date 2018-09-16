from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Volume(bot))


class Volume:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['vol'])
    @checks.dj_only()
    async def volume(self, ctx, volume: int = None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not volume:
            if player.volume > 100:
                return await ctx.send(f'🔊 | {player.volume}%')
            else:
                return await ctx.send(f'🔉 | {player.volume}%')

        old_volume = player.volume
        await player.set_volume(volume)

        if old_volume > volume:
            await ctx.send(f'🔉 | Set to {player.volume}%')
        else:
            await ctx.send(f'🔊 | Set to {player.volume}%')
