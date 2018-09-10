import asyncio

import discord
import lavalink
import re
import logging
import math

from discord.ext import commands

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
                    embed = discord.Embed(colour=c.guild.me.top_role.colour, title='Now Playing',
                                          description=event.track.title)
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
            if event.player.current is None or event.player.channel_id != 486765249488224277:
                await event.player.disconnect()

    @commands.command(aliases=['j', 'summon'])
    async def join(self, ctx):
        player = await self.get_player(context=ctx)
        player.store('channel', ctx.channel.id)
        check = await self.check_connect(ctx, player)
        if check is not None:
            return
        await player.connect(ctx.author.voice.channel.id)
        return await ctx.send(
            f'✅ I joined the voicechannel **`{ctx.author.voice.channel.name}`**!')

    @commands.command(aliases=['p', 'add'])
    async def play(self, ctx, *, query=None):
        player = await self.get_player(ctx)

        if query is None and player.paused and player.is_playing:
            await player.set_pause(False)
            return await ctx.send('⏯ | Resumed')
        elif query is None:
            return await ctx.send('🚫 Please specify a query!')

        check = await self.check_connect(ctx, player)
        if check is not None:
            return

        query = query.strip('<>')

        if not url_rx.match(query):
            query = f'ytsearch:{query}'

        results = await self.bot.lavalink.get_tracks(query)

        if not results or not results['tracks']:
            return await ctx.send('🚫 Nothing found!')

        embed = discord.Embed(colour=ctx.guild.me.top_role.colour)

        if results['loadType'] == "PLAYLIST_LOADED":
            tracks = results['tracks']

            for track in tracks:
                player.add(requester=ctx.author.id, track=track)

            embed.title = "Playlist Enqueued!"
            embed.description = f"{results['playlistInfo']['name']} - {len(tracks)} tracks"
            await ctx.send(embed=embed)
        else:
            track = results['tracks'][0]
            success_message = f':musical_note: **Track Enqueued:** {track["info"]["title"]}'
            await ctx.send(success_message)
            player.add(requester=ctx.author.id, track=track)

        if not player.is_playing:
            await player.play()

    @commands.command(aliases=['exit', 'quit', 'l'])
    async def leave(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_connected:
            return await ctx.send('🚫 Not connected.')

        if not ctx.author.voice or (player.is_connected and ctx.author.voice.channel.id != int(player.channel_id)):
            return await ctx.send('🚫 You\'re not in my voice channel!')

        player.queue.clear()
        await self.fade_out(player)
        await player.disconnect()
        await ctx.send('*⃣ | Disconnected.')
        await self.fade_in(player)

    @commands.command
    async def seek(self, ctx, time):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        seconds = time_rx.search(time)

        if not seconds:
            return await ctx.send('🚫 You need to specify the amount of seconds to seek!')

        seconds = int(seconds.group()) * 1000

        if time.startswith('-'):
            seconds *= -1

        track_time = player.position + seconds

        await player.seek(track_time)

        await ctx.send(f'✅ Seeked to **{lavalink.Utils.format_time(track_time)}**')

    @commands.command
    async def skip(self, ctx, *, to=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        await self.fade_out(player)
        await ctx.send('⏭ | Skipped.')

        skip_to = 1
        if to is not None:
            try:
                skip_to = int(to) - 1
            except ValueError:
                await ctx.send('🚫 Please specify a valid position to skip to!')

        if skip_to < 1:
            return await ctx.send('🚫 Please specify a valid position to skip to!')

        if len(player.queue) < skip_to:
            player.queue.clear()
            await player.skip()
            return await ctx.send('✅ There was no track at this position so I cleared the queue!')

        if to is not None:
            for x in range(0, skip_to):
                player.queue.pop(x)

        await player.skip()
        await self.fade_in(player)

    @commands.command
    async def stop(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        player.queue.clear()
        await self.fade_out(player)
        await player.stop()
        await ctx.send('⏹ | Stopped.')
        await self.fade_in(player)

    @commands.command(aliases=['q'])
    async def queue(self, ctx, page: int = 1):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.queue:
            return await ctx.send('🚫 There\'s nothing in the queue! Why not queue something?')

        items_per_page = 10
        pages = math.ceil(len(player.queue) / items_per_page)

        start = (page - 1) * items_per_page
        end = start + items_per_page

        queue_list = ''

        for i, track in enumerate(player.queue[start:end], start=start):
            queue_list += f'**`{i + 1}.`** [{track.title}]({track.uri}) {self.bot.get_user(track.requester).mention}\n'

        embed = discord.Embed(colour=ctx.guild.me.top_role.colour,
                              description=f'**Queue** - `{len(player.queue)}` tracks\n\n{queue_list}')
        embed.set_footer(text=f'Page {page}/{pages}')
        await ctx.send(embed=embed)

    @commands.command
    async def pause(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        if not player.paused:
            await player.set_pause(True)
            await ctx.send('⏯ | Paused')
        else:
            await ctx.send('🚫 I\'m already paused!')

    @commands.command
    async def resume(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        if player.paused:
            await player.set_pause(False)
            await ctx.send('⏯ | Resumed')
        else:
            await ctx.send('🚫 I\'m already resumed!')

    @commands.command(aliases=['vol'])
    async def volume(self, ctx, volume: int = None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not volume:
            if player.volume > 100:
                return await ctx.send(f'🔊 | {player.volume}%')
            else:
                return await ctx.send(f'🔉 | {player.volume}%')

        if player.volume > volume:
            await ctx.send(f'🔉 | Set to {player.volume}%')
        else:
            await ctx.send(f'🔊 | Set to {player.volume}%')

        await player.set_volume(volume)

    @commands.command
    async def shuffle(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        player.shuffle = not player.shuffle

        await ctx.send('🔀 | Shuffle ' + ('enabled' if player.shuffle else 'disabled'))

    @commands.command
    async def loop(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        player.repeat = not player.repeat

        await ctx.send('🔁 | Loop ' + ('enabled' if player.repeat else 'disabled'))

    @commands.command(aliases=['rm'])
    async def remove(self, ctx, index: int):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not index:
            return await ctx.send('🚫 Please specify a position!')

        if not player.queue:
            return await ctx.send('🚫 There\'s nothing queued!')

        if index > len(player.queue) or index < 1:
            return await ctx.send('🚫 Index has to be >=1 and <=queue size')

        index -= 1
        removed = player.queue.pop(index)

        await ctx.send('Removed **' + removed.title + '** from the queue.')

    @commands.command(aliases=['find'])
    async def search(self, ctx, *, query=None):
        player = await self.get_player(ctx)

        if not query:
            return await ctx.send('🚫 Please specify a query!')

        if not query.startswith('ytsearch:') and not query.startswith('scsearch:'):
            query = 'ytsearch:' + query

        results = await self.bot.lavalink.get_tracks(query)

        if not results or not results['tracks']:
            return await ctx.send('🚫 Nothing found')

        tracks = results['tracks'][:10]  # First 10 results

        o = ''
        for i, t in enumerate(tracks, start=1):
            o += f'`{i}.` [{t["info"]["title"]}]({t["info"]["uri"]})\n'

        embed = discord.Embed(colour=ctx.guild.me.top_role.colour,
                              description=o)

        await ctx.send(embed=embed)

        def pred(m):
            return m.author == ctx.message.author and m.channel == ctx.message.channel

        msg = await self.bot.wait_for('message', check=pred)

        error = False
        song = 11
        try:
            song = int(msg.content)
        except ValueError:
            error = True
        if song < 1 or song > 10 or error:
            return await ctx.send('🚫 Please enter a number from `1` to `10`! **Search cancelled!**')

        check = await self.check_connect(ctx, player)
        if check is not None:
            return

        track = tracks[song - 1]

        success_message = f':musical_note: **Track Enqueued:** {track["info"]["title"]}'
        await ctx.send(success_message)

        player.add(requester=ctx.author.id, track=track)

        if not player.is_playing:
            await player.play()

    @commands.command(aliases=['cls', 'cl'])
    async def clear(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        player.queue.clear()
        await ctx.send('✅ Successfully cleared the queue!')

    @commands.command(aliases=['restart', 'replay'])
    async def reset(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        await player.seek(0)
        await ctx.send('✅ Successfully reset the progress!')

    async def get_player(self, context):
        out = self.bot.lavalink.players.get(context.guild.id)
        return out

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
