from discord.ext import commands


def setup(bot):
    bot.add_cog(Outage(bot))


class Outage:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def outage(self, ctx, *, outage=None):
        trusted_users = [254892085000405004, 264048760580079616]
        if ctx.author.id not in trusted_users:
            return await ctx.send('🚫 This command is only executable by the devs!')

        if outage is None:
            return await ctx.send('🚫 You need to give an argument!')

        await self.bot.update_outage_channel(outage=outage)

        await ctx.send('✅ Updated outages message!')
