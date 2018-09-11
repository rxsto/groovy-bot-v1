import discord
from discord.ext import commands
from cogs.music import Music


def setup(bot):
    bot.add_cog(Search(bot))


class Search:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['find'])
    async def search(self, ctx, *, query=None):
        player = self.bot.lavalink.players.get(ctx.guild.id)

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

        check = await Music.check_connect(ctx, player)
        if check is not None:
            return

        track = tracks[song - 1]

        success_message = f':musical_note: **Track Enqueued:** {track["info"]["title"]}'
        await ctx.send(success_message)

        player.add(requester=ctx.author.id, track=track)

        if not player.is_playing:
            await player.play()
