#!/usr/bin/python3.7

import asyncio
import datetime
import os
import sys

import aiohttp
import discord
from discord import HTTPException, Message
from discord.ext import commands
from discord.ext.commands import context
from discord.ext.commands.errors import CommandNotFound, UserInputError

from entities.guild import GuildCache
from utilities import exceptions, logger
from utilities.config import Config
from utilities.database import PostgreClient
from utilities.game_animator import GameAnimator
from utilities.outages import outages
from utilities.status_page import StatusPage

if '--test-run' in sys.argv:
    exit(0)


class Groovy(commands.AutoShardedBot):
    async def get_server_prefix(self, bot: commands.AutoShardedBot, message: discord.Message):
        if not message.guild:
            return self.prefix
        custom_prefix = await self.retrieve_prefix(message.guild.id)
        result = commands.when_mentioned_or(custom_prefix)(bot, message)
        result.append(self.prefix)
        return result

    async def retrieve_prefix(self, guild_id):
        guild = await self.guild_cache.get(guild_id)
        return guild.prefix

    async def process_commands(self, message: Message):
        ctx = await self.get_context(message, cls=context.Context)

        if ctx.command is None:
            return

        async with ctx.channel.typing():
            await self.invoke(ctx)

    def __init__(self):
        super().__init__(command_prefix=self.get_server_prefix, case_insensitive=True)
        self.config = Config().get_config()
        self.debug = self.config['debug']
        self.session = aiohttp.ClientSession(loop=self.loop)
        self.updating = False
        if self.debug is True:
            self.prefix = 'gt!'
        else:
            self.prefix = 'g!'
        self.postgre_client = PostgreClient(self.config['database']['user'], self.config['database']['password'],
                                            self.config['database']['database'], self.config['database']['host'])

        logger.init()

        if self.debug:
            logger.debug("Starting Groovy in debug mode ...")
        else:
            logger.info('Starting Groovy ...')

        logger.info('Connecting to database ...')
        asyncio.get_event_loop().run_until_complete(self.postgre_client.connect())
        logger.info('Successfully connected to database!')

        self.guild_cache = GuildCache(self)

        logger.info('Logging in ...')
        if self.debug is True:
            self.run(self.config['test_bot']['token'])
        else:
            self.run(self.config['main_bot']['token'])

    async def on_ready(self):
        logger.info(f'Successfully logged in as {self.user.name}!')
        await self.init()
        GameAnimator(self, self.loop).run()
        if not self.is_in_debug_mode():
            await StatusPage(self.config, self).init()
        if not self.is_in_debug_mode():
            player = self.lavalink.players.get(403882830225997825)
            player.store('channel', 486765014976561159)
            await player.connect(486765249488224277)
            logger.info(f'Successfully connected to Groovys voicechannel!')
        await self.reconnect()
        await self.update_outage_channel('operational')

    async def on_shard_ready(self, shard_id):
        logger.info(f'Shard {shard_id + 1}/{self.shard_count} is ready!')

    async def on_guild_join(self, guild):
        if self.is_in_debug_mode():
            return
        await self.log_guild(True, guild)
        # Add guild to cache and to DB
        await self.guild_cache.get(guild.id)

    async def on_guild_remove(self, guild):
        if self.is_in_debug_mode():
            return
        await self.log_guild(False, guild)
        await self.guild_cache.delete(guild.id)
        self.lavalink.remove(guild.id)

    async def on_member_join(self, member):
        if not self.is_in_debug_mode():
            if member.guild.id == 403882830225997825:
                await self.log_member(True, member)

    async def on_member_remove(self, member):
        if not self.is_in_debug_mode():
            if member.guild.id == 403882830225997825:
                await self.log_member(False, member)

    async def on_message(self, msg: Message):
        if self.updating:
            return

        if msg.author.bot:
            return

        if not msg.channel:
            return

        if len(msg.content.split(' ')) == 1 and msg.content.startswith(f'<@{self.user.id}>'):
            prefix = await self.retrieve_prefix(msg.guild.id)
            await msg.channel.send(f':vulcan: Wazzup mate, my name is Groovy and you can control me with '
                                   f'**`{prefix}`**')

        try:
            await self.process_commands(msg)
        except CommandNotFound:
            return
        except exceptions.OwnerOnlyException:
            await msg.channel.send(
                '🚫 | **Only developers are permitted to execute that command!**'
            )
        except exceptions.PremiumOnlyException as error:
            await msg.channel.send(
                f'🚫 | **Only patrons are permitted to execute that command!**\n\n'
                f'If you want to become a patron donate at https://patreon.com/rxsto\n'
                f'If you already are a patron register at https://premium.groovybot.gq\n'
                f'**Needed pledge: `{error.needed_pledge}`**'
            )
        except exceptions.AdminOnlyException:
            await msg.channel.send(
                '🚫 | **Only Admins are permitted to execute that command!** '
                'You need at least the permission **`Manage Guild`**!'
            )
        except exceptions.DjOnlyException:
            await msg.channel.send(
                '🚫 | **Only DJs are permitted to execute that command!** You need the role **`DJ`**!'
            )

    async def on_command_completion(self, ctx):
        logger.info(
            f'{ctx.message.content} » {ctx.message.author.name}#{ctx.message.author.discriminator} '
            f'in #{ctx.message.channel.name} on {ctx.message.guild.name} ({ctx.message.guild.id}) - '
            f'Account: {self.user.name}'
        )

    async def on_command_error(self, ctx, error):
        if isinstance(error, CommandNotFound) or isinstance(error, UserInputError):
            return

        embed = discord.Embed(
            title=f'🚫 An internal error occurred! Bot: {self.user.name}',
            timestamp=datetime.datetime.now(),
            color=0xf22b2b,
            description=f'Error while parsing command `({ctx.message.content})` on guild **`{ctx.guild.name}`**'
                        f' `({ctx.guild.id})`'
                        f' in channel **`#{ctx.message.channel.name}`** `({ctx.message.channel.id})`!\n```{error}```'
        )
        await ctx.send(embed=embed)
        logger.error(f'Error while parsing command `({ctx.message.content})` on guild {ctx.guild.name} ({ctx.guild.id})'
                     f' in channel #{ctx.message.channel.name} ({ctx.message.channel.id}) ', error)

    async def init(self):
        dirname = os.path.dirname(__file__)
        filename = os.path.join(dirname, 'cogs/')
        extensions = os.listdir(filename)

        logger.info('Started loading cogs ...')
        for file in extensions:
            if file.startswith('__'):
                pass
            else:
                cog = file.split('.')[0]
                self.load_extension(f'cogs.{cog}')
        logger.info('Successfully loaded all cogs!')

    async def reconnect(self):
        async with self.postgre_client.get_pool().acquire() as connection:
            for guild in await connection.fetch('SELECT * FROM queues'):
                delete = await connection.prepare('DELETE FROM queues WHERE guild_id = $1')
                await delete.fetchval(int(guild['guild_id']))

                player = self.lavalink.players.get(guild['guild_id'])
                player.store('channel', guild['text_channel_id'])

                await player.connect(str(guild['channel_id']))

                track = await self.lavalink.get_tracks(guild['current_track'])
                player.add(requester=self.user.id, track=track['tracks'][0])

                await player.play()
                await player.seek(guild['current_position'])

                for queue_track in guild['queue'].replace('[', '').replace(']', '').replace('\'', '').split(', '):
                    track_result = await self.lavalink.get_tracks(queue_track)
                    if not track_result['tracks']:
                        return

                    player.add(requester=self.user.id, track=track_result['tracks'][0])

    async def update_outage_channel(self, outage=None):
        if self.is_in_debug_mode():
            return

        if outage is None:
            return logger.error('No outage was specified!')

        guild = self.get_guild(403882830225997825)
        channel = discord.utils.get(guild.channels, name='outages')
        category = self.get_channel(404311551248564255)

        overwrites = {
            guild.default_role: discord.PermissionOverwrite(
                send_messages=False,
                read_messages=True,
                read_message_history=True,
                external_emojis=True,
                add_reactions=True
            )
        }

        try:
            await channel.delete(reason='Updating outages message')
        except HTTPException:
            return logger.error('Something failed while deleting the outages channel!')

        new_channel = await guild.create_text_channel(
            name='outages',
            overwrites=overwrites,
            category=category,
            reason='Updating outages message'
        )

        await new_channel.send(outages[outage])

    async def log_guild(self, action_bool, guild):

        action = 'Joined' if action_bool is True else 'Left'
        title = '✅ Joined guild' if action_bool is True else '❌ Left guild'
        color = 0x22d65b if action_bool is True else 0xe85353

        logger.info(
            f'[Shard {guild.shard_id + 1}] {action} guild {guild.name} ({guild.id}) with {guild.member_count} users')
        async with aiohttp.ClientSession() as session:
            info_hook = await self.get_hook(hook_type='info', session=session)
            await info_hook.send(embed=discord.Embed(
                title=f'{title} {guild.name} ({guild.id})',
                timestamp=datetime.datetime.now(),
                color=color,
                description=f'Owner: {guild.owner.name}#{guild.owner.discriminator}\n'
                            f'Members: {guild.member_count}\n'
                            f'Shard: {guild.shard_id + 1}'
            ).set_thumbnail(url=guild.icon_url))

    async def log_member(self, action_bool, member):

        if member.bot:
            return

        title = '✅ Joined' if action_bool is True else '❌ Left'
        color = 0x22d65b if action_bool is True else 0xe85353

        async with aiohttp.ClientSession() as session:
            info_hook = await self.get_hook(hook_type='user', session=session)
            await info_hook.send(embed=discord.Embed(
                title=f'{title}: {member.name}#{member.discriminator} ({member.id})',
                timestamp=datetime.datetime.now(),
                description=member.mention,
                color=color
            ).set_thumbnail(url=member.avatar_url))

    async def get_hook(self, hook_type, session):
        return discord.Webhook.from_url(self.config['webhooks'][hook_type],
                                        adapter=discord.AsyncWebhookAdapter(session))

    def get_config(self):
        return self.config

    def get_ping(self):
        return self.latency

    def get_postgre_client(self):
        return self.postgre_client

    def is_in_debug_mode(self):
        return self.debug

    def is_updating(self):
        return self.updating

    def set_updating(self, updating):
        self.updating = updating


if __name__ == '__main__':
    instance = Groovy()
