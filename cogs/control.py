import asyncio
import discord
import lavalink

from discord.ext import commands
from discord.errors import NotFound

from cogs.music import Music


class Control:
    def __init__(self, user, guild, message, player, channel_id):
        self.user = user
        self.guild = guild
        self.message = message
        self.channel_id = channel_id
        self.player = player

    async def handle_reaction(self, reaction):
        emoji = reaction.emoji
        if emoji == '⏯':
            resume_response = '✅ Successfully resumed the music!' if self.player.paused else \
                '✅ Successfully paused music!'
            await self.player.set_pause(not self.player.paused)
            await self.send_response(resume_response)
        elif emoji == '⏭':
            await Music.fade_out(self.player)
            await self.player.skip()
            await Music.fade_in(self.player)
            await self.send_response('✅ Successfully skipped current song!')
        elif emoji == '⏹':
            self.player.queue.clear()
            await Music.fade_out(self.player)
            await self.player.stop()
            await Music.fade_in(self.player)
            await self.send_response('✅ Successfully stopped the music!')
        elif emoji == '🔂':
            repeat_response = '✅ Successfully enabled loop mode!' if not self.player.repeat else \
                '✅ Successfully disabled loop mode!'
            self.player.repeat = not self.player.repeat
            await self.send_response(repeat_response)
        elif emoji == '🔁':
            queue_loop_status = await self.player.toggle_queue_loop
            response = ':repeat: Successfully enabled queueloop' if queue_loop_status else\
                ':repeat: Successfully disabled queueloop'
            await self.send_response(response)
        elif emoji == '🔀':
            shuffle_response = '✅ Successfully enabled shuffle mode!' if not self.player.shuffle else \
                '✅ Successfully disabled shuffle mode!'
            self.player.shuffle = not self.player.shuffle
            await self.send_response(shuffle_response)
        elif emoji == '🔄':
            await self.player.seek(0)
            await self.send_response('✅ Successfully reset the current progress!')
        elif emoji == '🔊':
            if self.player.volume == 150:
                return await self.send_response('🚫 The volume is already at the maximum!')
            elif self.player.volume >= 490:
                await self.player.set_volume(150)
            else:
                await self.player.set_volume(self.player.volume + 10)
            await self.send_response(f'✅ Successfully set volume to `{self.player.volume}`!')
        elif emoji == '🔉':
            if self.player.volume == 0:
                return await self.send_response('🚫 The volume is already at the minimum!')
            elif self.player.volume <= 10:
                await self.player.set_volume(0)
            else:
                await self.player.set_volume(self.player.volume - 10)
            await self.send_response(f'✅ Successfully set volume to `{self.player.volume}`!')
        await self.update_message(False)

    async def send_response(self, response):
        async with self.channel.typing():
            message = await self.channel.send(response)
        await asyncio.sleep(3.5)
        try:
            await message.delete()
        except NotFound:
            pass

    async def update_message(self, loop):
        if self.player.current is None:
            if self.message:
                try:
                    return await self.message.delete()
                except NotFound:
                    return
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

        song = self.player.current

        desc = f'🎶 **{song.title}** (**{song.author}**)\n\n' \
               f'{play_type}{loop_type}{shuffle_type} ' \
               f'{self.get_percentage(self.player.position, song.duration)} **[{pos} / {dur}]**'

        embed = discord.Embed(
            colour=self.guild.me.top_role.colour,
            description=desc,
        )

        try:
            await self.message.edit(embed=embed)
        except NotFound:
            pass
        if loop:
            await asyncio.sleep(10)
            if self.message:
                await self.update_message(True)

    @property
    def whitelisted_members(self):
        out = list({})
        for member in self.channel.members:
            out.append(member.id)
        return out

    @property
    def channel(self):
        return self.guild.get_channel(self.channel_id)

    @staticmethod
    def get_percentage(progress, full):
        percent = round(progress / full, 2)
        bar = ''
        for x in range(0, 15):
            if int(percent * 15) == x:
                bar += '🔘'
            else:
                bar += '▬'
        return bar


class ControlCommand:
    def __init__(self, bot):
        self.bot = bot
        self.map = dict({})
        self.reacts = ['⏯', '⏭', '⏹', '🔂', '🔁', '🔀', '🔄', '🔉', '🔊']

    @commands.command(aliases=['cp', 'panel'])
    async def control(self, ctx):
        if ctx.guild.id in self.map.keys():
            msg = await ctx.send('🚫 You are already using an instance of the control panel on this guild! '
                                 'Dou you want to reset it?')
            await msg.add_reaction('✅')
            await msg.add_reaction('❌')

            def check(r, u):
                return u.id == ctx.author.id and r.message.id == msg.id
            reaction, user = await self.bot.wait_for('reaction_add', check=check)
            if reaction.emoji == '❌':
                return await msg.delete()
            elif reaction.emoji == '✅':
                if user.id not in self.map[ctx.guild.id].whitelisted_members:
                    return await ctx.send(':no_entry_ You\'re not allowed to use this command')
                else:
                    await msg.delete()
                    if self.map[ctx.guild.id].message is not None:
                        await self.map[ctx.guild.id].message.delete()

        player = self.bot.lavalink.players.get(ctx.guild.id)

        if not player.is_playing:
            return await ctx.send('🚫 I\'m not playing.')

        embed = discord.Embed(
            title=f'Control Panel - Loading',
            description='<a:groovyloading:487681291010179072> Please wait while the control panel is loading ...'
        )

        msg = await ctx.send(embed=embed)

        if ctx.invoked_with == 'cp' or ctx.invoked_with == 'control' or ctx.invoked_with == 'panel':
            for react in self.reacts:
                await msg.add_reaction(react)

            panel = Control(ctx.message.author, ctx.guild, msg, player, ctx.channel.id)
            self.map[ctx.guild.id] = panel
            await panel.update_message(True)
        else:
            panel = Control(ctx.message.author, ctx.guild, msg, player, ctx.channel)
            self.map[ctx.guild.id] = panel
            await panel.update_message(False)

    async def on_reaction_add(self, reaction, user):
        if user.bot:
            return
        if reaction.message.guild.id not in self.map:
            return
        user_panel = self.map[reaction.message.guild.id]
        if user_panel.message.id != reaction.message.id:
            return
        await reaction.message.remove_reaction(reaction.emoji, user)
        if reaction.emoji not in self.reacts:
            return
        if user.id not in user_panel.whitelisted_members:
            return
        await user_panel.handle_reaction(reaction)

    async def on_message_delete(self, message):
        if message.guild.id in self.map.keys():
            del self.map[message.guild.id]


def setup(bot):
    bot.add_cog(ControlCommand(bot))
