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
                    await c.send(':white_check_mark: The queue has ended! Why not queue more songs?')
            await asyncio.sleep(60 * 5)
            if event.player.current is None:
                await event.player.disconnect()

    @commands.command(aliases=['j', 'summon'])
    async def join(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_connected:
            if not ctx.author.voice or not ctx.author.voice.channel:
                return await ctx.send(':no_entry_sign: Join a voice channel!')

            permissions = ctx.author.voice.channel.permissions_for(ctx.me)

            if not permissions.connect:
                return await ctx.send(':no_entry_sign: Missing permissions `CONNECT`.')

            player.store('channel', ctx.channel.id)
            await player.connect(ctx.author.voice.channel.id)
            return await ctx.send(
                f':white_check_mark: I joined the voicechannel **`{ctx.author.voice.channel.name}`**!')
        else:
            return await ctx.send(':no_entry_sign: I\'m already inside a voicechannel!')

    @commands.command(aliases=['p', 'add'])
    async def play(self, ctx, *, query=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if query is None and player.paused and player.is_playing:
            await player.set_pause(False)
            return await ctx.send('⏯ | Resumed')
        elif query is None:
            return await ctx.send(':no_entry_sign: Please specify a query!')

        if not player.is_connected:
            if not ctx.author.voice or not ctx.author.voice.channel:
                return await ctx.send(':no_entry_sign: Join a voice channel!')

            permissions = ctx.author.voice.channel.permissions_for(ctx.me)

            if not permissions.connect or not permissions.speak:
                return await ctx.send(':no_entry_sign: Missing permissions `CONNECT` and/or `SPEAK`.')

            player.store('channel', ctx.channel.id)
            await player.connect(ctx.author.voice.channel.id)
        else:
            if not ctx.author.voice or not ctx.author.voice.channel or player.connected_channel.id\
                    != ctx.author.voice.channel.id:
                return await ctx.send(':no_entry_sign: Join my voice channel!')

        query = query.strip('<>')

        if not url_rx.match(query):
            query = f'ytsearch:{query}'

        results = await self.bot.lavalink.get_tracks(query)

        if not results or not results['tracks']:
            return await ctx.send(':no_entry_sign: Nothing found!')

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
            return await ctx.send(':no_entry_sign: Not connected.')

        if not ctx.author.voice or (player.is_connected and ctx.author.voice.channel.id != int(player.channel_id)):
            return await ctx.send(':no_entry_sign: You\'re not in my voicechannel!')

        player.queue.clear()
        await player.disconnect()

        await ctx.send('*⃣ | Disconnected.')

    @commands.command()
    async def seek(self, ctx, time):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        seconds = time_rx.search(time)

        if not seconds:
            return await ctx.send(':no_entry_sign: You need to specify the amount of seconds to seek!')

        seconds = int(seconds.group()) * 1000

        if time.startswith('-'):
            seconds *= -1

        track_time = player.position + seconds

        await player.seek(track_time)

        await ctx.send(f':white_check_mark: Seeked to **{lavalink.Utils.format_time(track_time)}**')

    @commands.command()
    async def skip(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        await ctx.send('⏭ | Skipped.')
        await player.skip()

    @commands.command()
    async def stop(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        player.queue.clear()
        await player.stop()
        await ctx.send('⏹ | Stopped.')

    @commands.command(aliases=['np'])
    async def now(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        song = 'Nothing'

        if player.current:
            pos = lavalink.Utils.format_time(player.position)
            if player.current.stream:
                dur = 'LIVE'
            else:
                dur = lavalink.Utils.format_time(player.current.duration)
            song = f'**[{player.current.title}]({player.current.uri})**\n({pos}/{dur})'

        embed = discord.Embed(colour=ctx.guild.me.top_role.colour, title='Now Playing', description=song)
        await ctx.send(embed=embed)

    @commands.command(aliases=['q'])
    async def queue(self, ctx, page: int = 1):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.queue:
            return await ctx.send(':no_entry_sign: There\'s nothing in the queue! Why not queue something?')

        items_per_page = 10
        pages = math.ceil(len(player.queue) / items_per_page)

        start = (page - 1) * items_per_page
        end = start + items_per_page

        queue_list = ''

        for i, track in enumerate(player.queue[start:end], start=start):
            queue_list += f'`{i + 1}.` [**{track.title}**]({track.uri})\n'

        embed = discord.Embed(colour=ctx.guild.me.top_role.colour,
                              description=f'**Queue - `{len(player.queue)}` tracks**\n\n{queue_list}')
        embed.set_footer(text=f'Viewing page {page}/{pages}')
        await ctx.send(embed=embed)

    @commands.command()
    async def pause(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        if not player.paused:
            await player.set_pause(True)
            await ctx.send('⏯ | Paused')
        else:
            await ctx.send(':no_entry_sign: I\'m already paused!')

    @commands.command()
    async def resume(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        if player.paused:
            await player.set_pause(False)
            await ctx.send('⏯ | Resumed')
        else:
            await ctx.send(':no_entry_sign: I\'m already resumed!')

    @commands.command(aliases=['vol'])
    async def volume(self, ctx, volume: int = None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not volume:
            return await ctx.send(f'🔈 | {player.volume}%')

        await player.set_volume(volume)
        await ctx.send(f'🔈 | Set to {player.volume}%')

    @commands.command()
    async def shuffle(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        player.shuffle = not player.shuffle

        await ctx.send('🔀 | Shuffle ' + ('enabled' if player.shuffle else 'disabled'))

    @commands.command()
    async def loop(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        player.repeat = not player.repeat

        await ctx.send('🔁 | Loop ' + ('enabled' if player.repeat else 'disabled'))

    @commands.command(aliases=['rm'])
    async def remove(self, ctx, index: int):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not index:
            return await ctx.send(':no_entry_sign: Please specify a position!')

        if not player.queue:
            return await ctx.send(':no_entry_sign: There\'s nothing queued!')

        if index > len(player.queue) or index < 1:
            return await ctx.send(':no_entry_sign: Index has to be >=1 and <=queue size')

        index -= 1
        removed = player.queue.pop(index)

        await ctx.send('Removed **' + removed.title + '** from the queue.')

    @commands.command(aliases=['find'])
    async def search(self, ctx, *, query=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not query:
            return await ctx.send(':no_entry_sign: Please specify a query!')

        if not query.startswith('ytsearch:') and not query.startswith('scsearch:'):
            query = 'ytsearch:' + query

        results = await self.bot.lavalink.get_tracks(query)

        if not results or not results['tracks']:
            return await ctx.send(':no_entry_sign: Nothing found')

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

        try:
            song = int(msg.content)
        except ValueError:
            return await ctx.send(':no_entry_sign: Please enter a number from `1` to `10`! **Search cancelled!**')

        if song < 1 or song > 10:
            return await ctx.send(':no_entry_sign: Please enter a number from `1` to `10`! **Search cancelled!**')

        if not player.is_connected:
            if not ctx.author.voice or not ctx.author.voice.channel:
                return await ctx.send(':no_entry_sign: Join a voice channel!')

            permissions = ctx.author.voice.channel.permissions_for(ctx.me)

            if not permissions.connect or not permissions.speak:
                return await ctx.send(':no_entry_sign: Missing permissions `CONNECT` and/or `SPEAK`.')

            player.store('channel', ctx.channel.id)
            await player.connect(ctx.author.voice.channel.id)

        else:
            if not ctx.author.voice or not ctx.author.voice.channel or player.connected_channel.id \
                    != ctx.author.voice.channel.id:
                return await ctx.send(':no_entry_sign: Join my voice channel!')

        track = tracks[song]

        success_message = f':musical_note: **Track Enqueued:** {track["info"]["title"]}'
        await ctx.send(success_message)

        player.add(requester=ctx.author.id, track=tracks[song])

        if not player.is_playing:
            await player.play()



def setup(bot):
    bot.add_cog(Music(bot))
