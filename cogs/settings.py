from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Settings(bot))


class Settings:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @checks.admin_only()
    async def prefix(self, ctx, prefix=None):
        guild = await self.bot.guild_cache.get(ctx.guild.id)
        if prefix is None:
            return await ctx.send(f':information_source: | The current prefix is **`{guild.prefix}`**')
        await guild.set_prefix(prefix)
        return await ctx.send(f'✅ | The prefix was successfully set to **`{prefix}`**')

    @commands.command(aliases=['dj', 'setdj', 'set_dj', 'djmode'])
    @checks.admin_only()
    async def dj_mode(self, ctx, dj_mode=None):
        guild = await self.bot.guild_cache.get(ctx.guild.id)
        if dj_mode is None:
            return await ctx.send(f':information_source: | The current DJ-Mode is **`{guild.dj_mode}`**')
        try:
            new_dj_mode = bool(dj_mode)
        except ValueError:
            return await ctx.send('🚫 | **Please specify a valid value! (true/false)**')
        await guild.set_dj_mode(new_dj_mode)
        return await ctx.send(f'✅ | The DJ-Mode was successfully set to **`{dj_mode}`**')
