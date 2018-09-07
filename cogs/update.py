from discord.ext import commands


def setup(bot):
    bot.add_cog(Update(bot))


class Update:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def update(self, ctx):
        trusted_users = [254892085000405004, 264048760580079616]
        if ctx.author.id not in trusted_users:
            return await ctx.send(':no_entry_sign: This command is only executable by the devs!')
        players = self.bot.lavalink.players

        for player_tuple in players:
            player = player_tuple[1]
            channel_id = player.fetch('channel')
            guild = self.bot.get_guild(player_tuple[0])
            channel = guild.get_channel(channel_id)

            if channel is None:
                return

            await channel.send(':warning: **Groovy is going to restart soon! '
                               'Please be patient! For further information '
                               'check Groovy\'s official support server: '
                               'https://groovybot.gq/support **')
