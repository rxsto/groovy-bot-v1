from discord.ext import commands


def setup(bot):
    bot.add_cog(Update(bot))


class Update:
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    async def update(self, ctx):
        if ctx.author.id is not 254892085000405004 or ctx.author.id is not 264048760580079616:
            return ctx.send(':no_entry_sign: This command is only executable by the devs!')
        players = self.bot.lavalink.players

        for player in players:
            await player.fetch('channel').send(':warning: **Groovy is going to restart soon! '
                                               'Please be patient! For further information '
                                               'check Groovy\'s official support server: '
                                               'https://groovybot.gq/support **')
