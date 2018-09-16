import discord
from discord.ext import commands

from cogs.music import Music


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
            return await ctx.send('🚫 | Please specify a query!')

        check = await Music.check_connect(ctx, player)
        if check is not None:
            return

        results = await Music.get_tracks(bot=self.bot, query=query, ctx=ctx)

        embed = discord.Embed(
            color=0x2C2F33
        )

        if results['loadType'] == "PLAYLIST_LOADED":
            tracks = results['tracks']

            if len(tracks) > 20:
                return await ctx.send(
                    '🚫 | **You can not queue a playlist that has more than 20 songs!**\n\n'
                    'If you want to add playlists with more than 20 songs to the queue you need to donate at '
                    'https://patreon.com/rxsto\n'
                    'If you already are a patron register at https://premium.groovybot.gq/ '
                )

            for track in tracks:
                player.add(requester=ctx.author.id, track=track)

            embed.title = "🎶 Playlist enqueued!"
            embed.description = f"{results['playlistInfo']['name']} - {len(tracks)} tracks"
            await ctx.send(embed=embed)
        else:
            await Music.enqueue_songs(player, results, ctx)

        if not player.is_playing and player.queue:
            await player.play()
