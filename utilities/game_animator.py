import random
import threading

from discord import Game, Status

from utilities import logger


class GameAnimator:
    def __init__(self, client, event_loop):
        logger.info('Initializing GameAnimator ...')
        self.client = client
        self.event_loop = event_loop

    def run(self):
        games = [
            f'on {len(self.client.guilds)} servers',
            f'for {len(self.client.users)} users',
            f'in {len(self.client.lavalink.players)} voicechannels',
            f'on {self.client.shard_count} shards',
            f'@Groovy',
            f'g!help',
            f'g!vote',
            f'g!donate',
            f'groovybot.gq',
            f'groovybot.gq/support',
            f'groovybot.gq/vote',
            f'groovybot.gq/sponsor',
            f'patreon.com/rxsto',
            f'twitter.com/rxsto_official',
            f'twitter.com/groovydevs',
            f'github.com/rxsto',
            f'rxsto.me',
            f'hosted by deinserverhost',
            f'deinserverhost.de'
        ]
        game = Game(f'{random.choice(games)}')
        self.event_loop.create_task(
            self.client.change_presence(status=Status.online, activity=game))
        threading.Timer(60.0, self.run).start()
