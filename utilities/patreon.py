import threading
from utilities import logger


class Patreon:
    def __init__(self, bot, event_loop):
        logger.info('Initializing Patreon ...')
        self.bot = bot
        self.event_loop = event_loop

    def run(self):
        self.event_loop.create_task(
            logger.error('Lol')
            # Renew token while getting new input (type etc)
        )
        threading.Timer(60.0, self.run).start()

    async def get_type(self, user_id):
        async with self.bot.postgre_client.get_pool().acquire() as connection:
            check = await connection.fetchrow(f'SELECT type FROM premium WHERE user_id = {user_id}')
            return check
