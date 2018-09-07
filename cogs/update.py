import asyncio
import time

from discord.ext import commands


def setup(bot):
    bot.add_cog(Update(bot))


class Update:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def update(self, ctx):
        trusted_users = [254892085000405004, 264048760580079616]
        self.bot.set_updating(True)
        if ctx.author.id not in trusted_users:
            return await ctx.send(':no_entry_sign: This command is only executable by the devs!')
        players = self.bot.lavalink.players

        status_msg = await ctx.send('<a:groovyloading:487681291010179072> Announcing groovy update')
        for player_tuple in players:
            player = player_tuple[1]
            channel_id = player.fetch('channel')
            guild = self.bot.get_guild(player_tuple[0])

            if guild is None:
                return

            channel = guild.get_channel(channel_id)

            if channel is None:
                return

            await channel.send(':warning: **Groovy is going to restart soon! '
                               'Please be patient! For further information '
                               'check Groovy\'s official support server: '
                               'https://groovybot.gq/support **')

            if player.current is None:
                return
            track_list = get_track_list(player.queue)

            async with self.bot.get_postgre_client().get_pool().acquire() as connection:
                statement = await connection.prepare(
                    'INSERT INTO queues (guild_id, current_track, current_position, queue, channel_id, text_channel_id)'
                    ' VALUES ($1, $2, $3, $4, $5, $6)')
                await statement.fetchval(player_tuple[0], player.current.uri, player.position, str(track_list),
                                         int(player.channel_id), channel_id)
            await player.set_volume(0)
            await asyncio.sleep(3)
            player.queue.clear()
            sound = await self.bot.lavalink.get_tracks('https://cdn.groovybot.gq/sounds/update.mp3')
            player.add(requester=254892085000405004, track=sound['tracks'][0])
            await player.skip()
            await player.set_volume(100)
            await asyncio.sleep(10)
            await player.disconnect()
        await status_msg.edit(content=':white_check_mark: **Finished!** Groovy is going to shutdown now!')
        time.sleep(5)


def get_track_list(tracks):
    out = []
    for track in tracks:
        out.append(track.uri)
    return out
