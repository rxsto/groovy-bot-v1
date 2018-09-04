import _thread
import random
import time

from discord import Game, Status
from utilities import logger

run = True


async def init(client):
    _thread.start_new_thread(await start(client), ('game_animator', 2))


async def start(client):
    games = [
        f'on {len(client.guilds)} servers',
        f'playing for {len(client.users)} users',
        f'listen to some f*cking music!',
        f'how you doin\'?'
    ]

    while run is True:
        game = Game(f'@Groovy - {random.choice(games)}')
        await client.change_presence(status=Status.online, activity=game)
        logger.info('Changed Groovy\'s internal game!')
        time.sleep(60)
