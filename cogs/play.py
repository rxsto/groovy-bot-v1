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
        if query is None and player.paused and player.is_playing:
            await player.set_pause(False)
            return await ctx.send('⏯ | Resumed')
        elif query is None:
            return await ctx.send('🚫 Please specify a query!')

        check = await Music.check_connect(ctx, player)
        if check is not None:
            return

        results = await Music.get_tracks(bot=self.bot, query=query, ctx=ctx)

        embed = discord.Embed(colour=ctx.guild.me.top_role.colour)

        if results['loadType'] == "PLAYLIST_LOADED":
            tracks = results['tracks']

            for track in tracks:
                player.add(requester=ctx.author.id, track=track)

            embed.title = "Playlist enqueued!"
            embed.description = f"{results['playlistInfo']['name']} - {len(tracks)} tracks"
            await ctx.send(embed=embed)
        else:
            await Music.enqueue_songs(player, results, ctx)

        if not player.is_playing:
            await player.play()
