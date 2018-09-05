from discord.ext import commands


def setup(bot):
    bot.add_cog(Stats(bot))


class Stats:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def stats(self, ctx):
        await ctx.send(f':information_source: I\'m playing on **{len(self.bot.guilds)} '
                       f'servers** for **{len(self.bot.users)} users** '
                       f'in **{len(self.bot.voice_clients)} voicechannels**. '
                       f'My ping is currently **{int(self.bot.latency * 1000)} ms**.')
