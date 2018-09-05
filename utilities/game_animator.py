import threading
import random
from discord import Status, Game


class GameAnimator:
    def __init__(self, client, event_loop):
        self.client = client
        self.event_loop = event_loop

    def run(self):
        games = [
            f'on {len(self.client.guilds)} servers',
            f'playing for {len(self.client.users)} users',
            f'playing in {len(self.client.voice_clients)} voicechannels',
            f'currently serving {self.client.shard_count} shards',
            f'you\'re on shard {self.client.shard_id}'
            f'listen to some f*cking music!',
            f'how you doin\'?',
            f'join my server!',
            f'I\'m Groovy, you know me?',
            f'better than Rythm',
            f'it\'s not a bug, it\'s a feature!',
            f'check .help',
            f'patreon.com/rxsto',
            f'twitter.com/rxsto_official',
            f'github.com/rxsto'
        ]
        game = Game(f'@Groovy - {random.choice(games)}')
        self.event_loop.create_task(
            self.client.change_presence(status=Status.online, activity=game))
        threading.Timer(60.0, self.run).start()
