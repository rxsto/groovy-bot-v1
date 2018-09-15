from discord.ext import commands
from utilities import exceptions


def owner_only():
    async def predicate(ctx):
        if check_owner(ctx):
            return True
        raise exceptions.OwnerOnlyException

    return commands.check(predicate)


def check_owner(ctx):
    return ctx.author.id in ctx.bot.get_config()['owners']


def premium_only(pledge):
    async def predicate(ctx):
        if check_owner(ctx):
            return True
        async with ctx.bot.get_postgre_client().get_pool().acquire() as connection:
            statement = await connection.prepare('SELECT type FROM premium WHERE user_id = $1')
            patron_type = await statement.fetchval(ctx.author.id)
            if patron_type is None or patron_type < pledge:
                raise exceptions.PremiumOnlyException(pledge)

            return True

    return commands.check(predicate)


