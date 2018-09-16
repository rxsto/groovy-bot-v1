from threading import Timer

from discord import Game, Status
from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Update(bot))


class Update:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @checks.owner_only()
    async def update(self, ctx):
        msg = await ctx.send('⚠ | Do you want to update the bot?')
        await msg.add_reaction('✅')
        await msg.add_reaction('❌')

        def check(r, u):
            return u.id == ctx.author.id and r.message.id == msg.id

        reaction = await self.bot.wait_for('reaction_add', check=check)
        if reaction.emoji == '❌':
            return await msg.delete()
        elif reaction.emoji == '✅':
            await msg.delete()

        self.bot.set_updating(True)

        game = Game('Updating!')
        await self.bot.change_presence(status=Status.online, activity=game)

        players = self.bot.lavalink.players

        status_msg = await ctx.send('<a:groovyloading:487681291010179072> Announcing **Update** - '
                                    'Please **wait** until the process has **finished**!')

        await self.bot.update_outage_channel(outage='restart')

        for player_tuple in players:
            player = player_tuple[1]
            channel_id = player.fetch('channel')
            guild = self.bot.get_guild(player_tuple[0])

            if guild is None:
                return

            channel = guild.get_channel(channel_id)

            if channel is None:
                return

            if player.current is None:
                await channel.send(':warning: | **Groovy is going to restart soon! Please be patient! '
                                   'For further information check Groovy\'s official support server:** '
                                   'https://groovybot.gq/support')
            else:
                track_list = get_track_list(player.queue)

                async with self.bot.get_postgre_client().get_pool().acquire() as connection:
                    statement = await connection.prepare(
                        'INSERT INTO queues ('
                        'guild_id, current_track, current_position, queue, channel_id, text_channel_id'
                        ')'
                        ' VALUES ($1, $2, $3, $4, $5, $6)')
                    await statement.fetchval(player_tuple[0], player.current.uri, player.position, str(track_list),
                                             int(player.channel_id), channel_id)
                await player.set_volume(0)
                player.queue.clear()
                sound = await self.bot.lavalink.get_tracks('https://cdn.groovybot.gq/sounds/update.mp3')
                player.add(requester=254892085000405004, track=sound['tracks'][0])
                if player.paused:
                    await player.set_pause(False)
                await player.set_volume(100)
                await player.skip()
                Timer(8, self.bot.loop.create_task(player.disconnect()))
        await status_msg.edit(content='✅ | **Groovy is able to be restarted!**')


def get_track_list(tracks):
    out = []
    for track in tracks:
        out.append(track.uri)
    return out
