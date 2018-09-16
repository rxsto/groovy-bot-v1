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
        async with self.bot.get_postgre_client().get_pool().acquire() as connection:
            if prefix is None:
                result = await connection.fetchrow(
                    f'SELECT prefix FROM guilds WHERE id = {ctx.guild.id}')
                current_prefix = result['prefix']
                return await ctx.send(f':information_source: | The current prefix is **`{current_prefix}`**')
            prepared_statement = await connection.prepare('''UPDATE guilds SET prefix = $1 WHERE id = $2''')
            await prepared_statement.fetchval(prefix, ctx.guild.id)
            return await ctx.send(f'✅ | The prefix was successfully set to **`{prefix}`**')

    @commands.command(aliases=['dj', 'setdj', 'set_dj', 'djmode'])
    @checks.admin_only()
    async def dj_mode(self, ctx, dj_mode=None):
        async with self.bot.get_postgre_client().get_pool().acquire() as connection:
            if dj_mode is None:
                result = await connection.fetchrow(
                    f'SELECT dj_mode FROM guilds WHERE id = {ctx.guild.id}')
                current_dj_mode = result['dj_mode']
                return await ctx.send(f':information_source: | The current DJ-Mode is **`{current_dj_mode}`**')
            if str(dj_mode).lower() == 'true':
                new_dj_mode = True
            elif str(dj_mode).lower() == 'false':
                new_dj_mode = False
            else:
                return await ctx.send('🚫 | **Please specify a valid value! (true/false)**')
            prepared_statement = await connection.prepare('''UPDATE guilds SET dj_mode = $1 WHERE id = $2''')
            await prepared_statement.fetchval(new_dj_mode, ctx.guild.id)
            return await ctx.send(f'✅ | The DJ-Mode was successfully set to **`{dj_mode}`**')
