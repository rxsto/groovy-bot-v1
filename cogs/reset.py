from discord.ext import commands


def setup(bot):
    bot.add_cog(Reset(bot))


class Reset:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['restart', 'replay'])
    async def reset(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        await player.seek(0)
        await ctx.send('✅ Successfully reset the progress!')

    async def get_player(self, context):
        out = self.bot.lavalink.players.get(context.guild.id)
        return out
