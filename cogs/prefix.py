from discord.ext import commands


def setup(bot):
    bot.add_cog(Prefix(bot))


class Prefix:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def prefix(self, ctx, prefix=None):
        async with self.bot.get_postgre_client().get_pool().acquire() as connection:
            if prefix is None:
                result = await connection.fetchrow(
                    f'SELECT prefix FROM guilds WHERE id = {ctx.guild.id}')
                current_prefix = result['prefix']
                return await ctx.send(f':information_source: The current prefix is **`{current_prefix}`**')
            prepared_statement = await connection.prepare('''UPDATE guilds SET prefix = $1 WHERE id = $2''')
            await prepared_statement.fetchval(prefix, ctx.guild.id)
            return await ctx.send(f':white_check_mark: The prefix was successfully set to **`{prefix}`**')
