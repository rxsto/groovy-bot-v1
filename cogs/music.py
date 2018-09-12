import asyncio

import discord
import lavalink
import re
import logging

time_rx = re.compile('[0-9]+')
url_rx = re.compile("https?://(?:www\.)?.+")


class Music:
    def __init__(self, bot):
        self.bot = bot

        if not hasattr(bot, 'lavalink'):
            lavalink.Client(bot=bot, host=bot.get_config()['lavalink']['host'],
                            ws_port=bot.get_config()['lavalink']['port'],
                            password=bot.get_config()['lavalink']['password'], loop=self.bot.loop,
                            log_level=logging.INFO)
        self.bot.lavalink.register_hook(self.track_hook)

    async def track_hook(self, event):
        if isinstance(event, lavalink.Events.TrackStartEvent):
            c = event.player.fetch('channel')
            if c:
                c = self.bot.get_channel(c)
                if c:
                    embed = discord.Embed(colour=c.guild.me.top_role.colour, title='🎶 Now Playing',
                                          description=f'{event.track.title} ({event.track.author})')
                    embed.set_thumbnail(url=event.track.thumbnail)
                    await c.send(embed=embed)
        elif isinstance(event, lavalink.Events.QueueEndEvent):
            if self.bot.is_updating():
                return
            c = event.player.fetch('channel')
            if c:
                c = self.bot.get_channel(c)
                if c:
                    await c.send('✅ The queue has ended! Why not queue more songs?')
            await asyncio.sleep(60 * 5)

            if event.player.channel_id == '486765249488224277':
                return

            if event.player.current is None:
                await event.player.disconnect()

    @staticmethod
    async def check_connect(context, player):
        if not player.is_connected:
            if not context.author.voice or not context.author.voice.channel:
                return await context.send('🚫 Join a voice channel!')

            permissions = context.author.voice.channel.permissions_for(context.me)

            if not permissions.connect or not permissions.speak:
                return await context.send('🚫 Missing permissions `CONNECT` and/or `SPEAK`.')

            player.store('channel', context.channel.id)
            await player.connect(context.author.voice.channel.id)
        else:
            if not context.author.voice or not context.author.voice.channel or player.connected_channel.id \
                    != context.author.voice.channel.id:
                return await context.send('🚫 Join my voice channel!')

    @staticmethod
    async def fade_out(player):
        await player.set_volume(0)
        await asyncio.sleep(2.5)

    @staticmethod
    async def fade_in(player):
        await player.set_volume(100)


def setup(bot):
    bot.add_cog(Music(bot))
