import asyncio

import discord
import lavalink
from discord.ext import commands


class Control:
    def __init__(self, user, guild, message, player):
        self.user = user
        self.guild = guild
        self.message = message
        self.player = player

    async def handle_reaction(self, reaction):
        emoji = reaction.emoji
        if emoji == '⏯':
            await self.player.set_pause(not self.player.paused)
        elif emoji == '⏭':
            await self.player.skip()
        elif emoji == '⏹':
            self.player.queue.clear()
            await self.player.stop()
        elif emoji == '🔂':
            self.player.repeat = not self.player.repeat
        elif emoji == '🔁':
            msg = await self.message.channel.send(':warning: **This feature is currently under development!**')
            await asyncio.sleep(5)
            await msg.delete()
        elif emoji == '🔀':
            self.player.shuffle = not self.player.shuffle
        await self.update_message()

    async def update_message(self):
        if self.player.current is None:
            await self.message.channel.send(':white_check_mark: Successfully stopped playing!')
            await self.message.delete()
            del self
            return
        pos = lavalink.Utils.format_time(self.player.position)
        if self.player.current.stream:
            dur = 'LIVE'
        else:
            dur = lavalink.Utils.format_time(self.player.current.duration)
        play_type = '⏸' if self.player.paused else '▶'
        loop_type = '🔂' if self.player.repeat else ''
        shuffle_type = '🔀' if self.player.shuffle else ''
        desc = f'{play_type}{loop_type}{shuffle_type} ' \
               f'**[{pos} / {dur}]**'
        song = self.player.current
        embed = discord.Embed(
            colour=self.guild.me.top_role.colour,
            title=song.title,
            url=song.uri,
            description=desc
        ).set_thumbnail(url=song.thumbnail)
        await self.message.edit(embed=embed)


class ControlCommand:
    def __init__(self, bot):
        self.bot = bot
        self.map = dict({})
        self.reacts = ['⏯', '⏭', '⏹', '🔂', '🔁', '🔀']

    @commands.command(aliases=['cp', 'panel'])
    async def control(self, ctx):
        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send(':no_entry_sign: I\'m not playing.')

        embed = discord.Embed(
            title='Control Panel',
            description='You can use the control panel by clicking on the reactions!'
        )

        msg = await ctx.send(embed=embed)
        for react in self.reacts:
            await msg.add_reaction(react)
        panel = Control(ctx.message.author, ctx.guild, msg, player)
        self.map[ctx.guild.id] = panel

    async def on_reaction_add(self, reaction, user):
        if user.bot:
            return
        if reaction.message.guild.id not in self.map:
            return
        await reaction.message.remove_reaction(reaction.emoji, user)
        if reaction.emoji not in self.reacts:
            return
        user_panel = self.map[reaction.message.guild.id]
        if user.id is not user_panel.user.id:
            return
        await user_panel.handle_reaction(reaction)


def setup(bot):
    bot.add_cog(ControlCommand(bot))
