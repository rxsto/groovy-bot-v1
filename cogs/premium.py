from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Premium(bot))


class Premium:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['addpremium'])
    @checks.owner_only()
    async def premium(self, ctx, user_id=None, patreon_type=None):
        if len(ctx.message.mentions) == 0 and user_id is None:
            return await ctx.send('🚫 | You need to give an argument!')

        if len(ctx.message.mentions) == 0:
            try:
                add_id = int(user_id)
            except ValueError:
                return await ctx.send('🚫 | You need to give a valid argument!')
        else:
            add_id = ctx.message.mentions[0].id

        if len(str(add_id)) < 18 or len(str(add_id)) > 18:
            return await ctx.send('🚫 | You need to give a valid argument!')

        if patreon_type is None:
            add_type = 2
        else:
            try:
                add_type = int(patreon_type)
            except ValueError:
                return await ctx.send('🚫 | You need to give a valid type!')

        if add_type < 1 or add_type > 2:
            return await ctx.send('🚫 | You need to give a valid type!')

        async with self.bot.postgre_client.get_pool().acquire() as connection:
            patreon_type_check = await checks.get_premium_type(add_id, self.bot.postgre_client.get_pool())

            if patreon_type_check is None:
                statement = await connection.prepare(
                    'INSERT INTO premium (user_id, type, "check") VALUES ($1, $2, $3)'
                )
                await statement.fetchval(add_id, add_type, False)
                return await ctx.send(f'✅ | **Successfully added `{add_id}` with type `{add_type}`!**')
            else:
                statement = await connection.prepare(
                    'UPDATE premium SET user_id = $1, type = $2, "check" = $3'
                )
                await statement.fetchval(add_id, add_type, False)
                return await ctx.send(f'✅ | **Successfully updated `{add_id}` with type `{add_type}`!**')
