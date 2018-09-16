from discord.ext import commands

from utilities import checks


def setup(bot):
    bot.add_cog(Cleanup(bot))


class Cleanup:
    def __init__(self, bot):
        self.bot = bot

    @commands.command(aliases=['clean'])
    @checks.dj_only()
    async def cleanup(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        members = []

        for member in ctx.me.voice.channel.members:
            members.append(member.id)

        new_queue = []

        for song in player.queue:
            if song.requester in members:
                new_queue.append(song)

        player.queue = new_queue

        ctx.send('✅ | Successfully cleaned the queue! All tracks from users that are currently in this voicechannel '
                 'are still in the queue!')
