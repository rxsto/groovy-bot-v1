from discord.ext import commands
from cogs.music import url_rx, Music
from lavalink.AudioTrack import AudioTrack


def setup(bot):
    bot.add_cog(Playtop(bot))


class Playtop:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['pt', 'addtop'])
    async def playtop(self, ctx, *, query=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if query is None:
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

        if results['loadType'] == "PLAYLIST_LOADED":
            return await ctx.send('🚫 You cannot add a playlist to the top of the queue!')
        else:
            track = results['tracks'][0]
            success_message = f':musical_note: **Track enqueued:** {track["info"]["title"]}'
            await ctx.send(success_message)
            player.queue.insert(0, AudioTrack().build(track, ctx.author.id))

        if not player.is_playing:
            await player.play()
