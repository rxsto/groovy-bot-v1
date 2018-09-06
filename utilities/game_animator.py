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
            f'for {len(self.client.users)} users',
            f'in {len(self.client.lavalink.players)} voicechannels',
            f'on {self.client.shard_count} shards',
            f'Listen to some f*cking music!',
            f'How you doin\'?',
            f'Join my server!',
            f'Let\'s get the biggest bot on Discord! Muhahahahaa!',
            f'I\'m Groovy, you know me?',
            f'Mention me! Like @Groovy',
            f'Better than Rythm',
            f'It\'s not a bug, it\'s a feature!',
            f'Check g!help',
            f'Do you like what you hear?',
            f'Vote for me!',
            f'2 + 2 = 5!',
            f'Skibidi papapapa! Skraaa!',
            f'I am written in Delphi!',
            f'Composing some lit music!',
            f'Generating useless hash-codes!',
            f'groovybot.gq',
            f'patreon.com/rxsto',
            f'twitter.com/rxsto_official',
            f'github.com/rxsto'
        ]
        game = Game(f'{random.choice(games)}')
        self.event_loop.create_task(
            self.client.change_presence(status=Status.online, activity=game))
        threading.Timer(60.0, self.run).start()
