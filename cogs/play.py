import discord
from discord.ext import commands
from cogs.music import url_rx, Music


def setup(bot):
    bot.add_cog(Play(bot))


class Play:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['p', 'add'])
    async def play(self, ctx, *, query=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)
        await player.toggle_loop_queue
        if query is None and player.paused and player.is_playing:
            await player.set_pause(False)
            return await ctx.send('⏯ | Resumed')
        elif query is None:
            return await ctx.send('🚫 Please specify a query!')

        check = await Music.check_connect(ctx, player)
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

            embed.title = "Playlist enqueued!"
            embed.description = f"{results['playlistInfo']['name']} - {len(tracks)} tracks"
            await ctx.send(embed=embed)
        else:
            track = results['tracks'][0]
            success_message = f'🎶 **Track enqueued:** {track["info"]["title"]}'
            await ctx.send(success_message)
            player.add(requester=ctx.author.id, track=track)

        if not player.is_playing:
            await player.play()
