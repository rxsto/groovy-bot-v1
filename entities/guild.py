class Guild:
    def __init__(self, guild_id, cache, prefix, volume, dj_mode):
        self.id = guild_id
        self.cache = cache
        self.prefix = prefix
        self.volume = volume
        self.dj_mode = dj_mode

    async def set_prefix(self, prefix):
        self.prefix = prefix
        await self.cache.update(self)

    async def set_volume(self, volume):
        self.volume = volume
        await self.cache.update(self)

    async def set_dj_mode(self, dj_mode):
        self.dj_mode = dj_mode
        await self.cache.update(self)


class GuildCache:
    def __init__(self, bot):
        self.bot = bot
        self.cache = dict()

    async def get_information_or_create(self, guild_id):
        async with self.bot.postgre_client.get_pool().acquire() as connection:
            guild = await connection.fetchrow(f'SELECT * FROM guilds WHERE id = {guild_id}')
            if guild is None:
                await connection.execute(f'INSERT INTO guilds (id, prefix, volume, dj_mode) VALUES '
                                         f'({guild_id}, \'g!\', 100, FALSE)')
                return 'g!', 100, False
            return guild['prefix'], guild['volume'], guild['dj_mode']

    async def update(self, guild: Guild):
        self.cache[guild.id] = guild
        async with self.bot.postgre_client.get_pool().acquire() as connection:
            statement = await connection.prepare('UPDATE guilds SET prefix = $1, volume = $2, dj_mode = $3')
            await statement.fetchval(guild.prefix, guild.volume, guild.dj_mode)

    async def get(self, guild_id):
        if guild_id not in self.cache:
            prefix, volume, dj_mode = await self.get_information_or_create(guild_id)
            new_guild = Guild(guild_id, self, prefix, volume, dj_mode)
            self.cache[guild_id] = new_guild
        return self.cache[guild_id]
