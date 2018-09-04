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
            f'listen to some f*cking music!',
            f'how you doin\'?'
        ]
        game = Game(f'@Groovy - {random.choice(games)}')
        self.event_loop.create_task(
            self.client.change_presence(status=Status.online, activity=game))
        threading.Timer(60.0, self.run).start()
