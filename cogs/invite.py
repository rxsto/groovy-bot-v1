from discord.ext import commands


def setup(bot):
    bot.add_cog(Invite(bot))


class Invite:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def invite(self, ctx):
        await ctx.send(':information_source: You can invite me here: url')
