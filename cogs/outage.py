from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Outage(bot))


class Outage:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @checks.owner_only()
    async def outage(self, ctx, *, outage=None):
        if outage is None:
            return await ctx.send('🚫 | You need to give an argument!')

        try:
            await self.bot.update_outage_channel(outage=outage)
        except ValueError:
            return await ctx.send('🚫 | You need to give an valid argument!')

        await ctx.send('✅ | Updated outages message!')
