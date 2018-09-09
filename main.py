#!/usr/bin/python3.7

import asyncio
import os
import sys

import aiohttp
import discord
import datetime

from discord import Message, HTTPException
from discord.ext import commands
from discord.ext.commands.errors import CommandNotFound, UserInputError
from utilities import logger, status_page
from utilities.outages import outages
from utilities.game_animator import GameAnimator
from utilities.config import Config
from utilities.database import PostgreClient

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
        async with self.postgre_client.get_pool().acquire() as connection:
            response = await connection.fetchrow(
                f'SELECT prefix FROM guilds WHERE id = {guild_id}')
            if response is None:
                await connection.execute(
                    f'INSERT INTO guilds (id, prefix, volume) VALUES ({guild_id}, \'g!\', 100)')
                return self.prefix
            else:
                return response["prefix"]


    def __init__(self):
        super().__init__(command_prefix=self.get_server_prefix, case_insensitive=True)
        self.config = Config().get_config()
        self.debug = self.config['debug']
        self.updating = False
        if self.debug is True:
            self.prefix = 'gt!'
        else:
            self.prefix = 'g!'
        logger.init()

        if self.debug:
            logger.debug("Starting in debug mode!")

        logger.info('Logging in ...')

        logger.info('Starting Groovy ...')
        self.postgre_client = PostgreClient(self.config['database']['user'], self.config['database']['password'],
                                            self.config['database']['database'], self.config['database']['host'])

        asyncio.get_event_loop().run_until_complete(self.postgre_client.connect())

        if self.debug is True:
            self.run(self.config['test_bot']['token'])
        else:
            self.run(self.config['main_bot']['token'])

    async def on_ready(self):
        logger.info(f'Logged in as {self.user.name} ...')
        await self.init()
        GameAnimator(self, self.loop).run()
        status_page.StatusPage(self.config, self).init()
        if not self.is_in_debug_mode():
            player = self.lavalink.players.get(403882830225997825)
            player.store('channel', 486765014976561159)
            await player.connect('486765249488224277')
        await self.reconnect()
        await self.update_outage_channel('operational')

    async def on_shard_ready(self, shard_id):
        logger.info(f'Shard {shard_id + 1}/{self.shard_count} is ready!')

    async def on_guild_join(self, guild):
        logger.info(
            f'[Shard {guild.shard_id + 1}] Joined guild {guild.name} ({guild.id}) with {guild.member_count} users')
        async with aiohttp.ClientSession() as session:
            error_hook = discord.Webhook.from_url(Config().get_config()['webhooks']['info'],
                                                  adapter=discord.AsyncWebhookAdapter(session))
            await error_hook.send(embed=discord.Embed(
                title=f":white_check_mark: Joined guild {guild.name} ({guild.id})",
                timestamp=datetime.datetime.now(),
                color=0x22d65b,
                description=f'Owner: {guild.owner.name}#{guild.owner.discriminator}\n'
                            f'Members: {guild.member_count}\n'
                            f'Shard: {guild.shard_id + 1}'
            ).set_thumbnail(url=guild.icon_url))
            async with self.postgre_client.get_pool().acquire() as connection:
                check = await connection.fetchrow(f'SELECT * FROM guilds WHERE id = {guild.id}')
                if check is None:
                    await connection.execute(
                        f'INSERT INTO guilds (id, prefix, volume) VALUES ({guild.id}, \'g!\', 100)')

    async def on_guild_remove(self, guild):
        message = '<:hey:454004173013254155> Hey! What a pity that Groovy **didn\'t fit your expectations!** ' \
                  'We would like to **improve** him, but we don\'t know what to **change**, ' \
                  'unless you **join our server** and **tell us what we could do better**. ' \
                  'So do us the **favour** and join Groovy\'s support server and ' \
                  '**tell the devs** what you want to have **changed**! **Thank you!** - https://groovybot.gq/support'
        try:
            await guild.owner.send(message)
        except discord.Forbidden as e:
            print(e)

        logger.info(
            f'[Shard {guild.shard_id + 1}] Left guild {guild.name} ({guild.id}) with {guild.member_count} users')
        async with aiohttp.ClientSession() as session:
            error_hook = discord.Webhook.from_url(Config().get_config()['webhooks']['info'],
                                                  adapter=discord.AsyncWebhookAdapter(session))
            await error_hook.send(embed=discord.Embed(
                title=f":x: Left guild {guild.name} ({guild.id})",
                timestamp=datetime.datetime.now(),
                color=0xf22b2b,
                description=f'Owner: {guild.owner.name}#{guild.owner.discriminator}\n'
                            f'Members: {guild.member_count}\n'
                            f'Shard: {guild.shard_id + 1}'
            ).set_thumbnail(url=guild.icon_url))
            async with self.postgre_client.get_pool().acquire() as connection:
                await connection.execute(f'DELETE FROM guilds WHERE id = {guild.id}')

    async def on_message(self, msg: Message):
        if self.updating:
            return

        if msg.author.bot:
            return

        if not msg.channel:
            return

        if msg.channel is discord.ChannelType.private:
            return await msg.channel.send(':v: Hey mate, if you want to use me, just invite me to your server! See ya!')

        if len(msg.content.split(' ')) == 1 and msg.content.startswith(f'<@{self.user.id}>'):
            prefix = await self.retrieve_prefix(msg.guild.id)
            await msg.channel.send(f':vulcan: Wazzup mate, my name is Groovy and you can control me with '
                                   f'**`{prefix}`**')

        try:
            await self.process_commands(msg)
        except CommandNotFound:
            return

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
            title=":no_entry_sign: An internal error occurred!",
            timestamp=datetime.datetime.now(),
            color=0xf22b2b,
            description=f'Error while parsing command `({ctx.message.content})` on guild **`{ctx.guild.name}`**'
                        f' `({ctx.guild.id})`'
                        f' in channel **`#{ctx.message.channel.name}`** `({ctx.message.channel.id})`!\n```{error}```'
        )
        await ctx.send(embed=embed)
        logger.error(f'Error while parsing command `({ctx.message.content})` on guild {ctx.guild.name} ({ctx.guild.id})'
                     f' in channel #{ctx.message.channel.name} ({ctx.message.channel.id}) ', error)

    async def on_command(self, ctx):
        await ctx.trigger_typing()
        return self

    async def init(self):
        dirname = os.path.dirname(__file__)
        filename = os.path.join(dirname, 'cogs/')
        extensions = os.listdir(filename)

        logger.info('Started loading cogs ...')

        for file in extensions:
            if file.startswith('__'):
                logger.warn(f'There is a file or dir in /cogs/ which is no cog: {file}')
            else:
                cog = file.split('.')[0]
                self.load_extension(f'cogs.{cog}')
                logger.info(f'Successfully loaded cog {cog}!')

    async def reconnect(self):
        async with self.get_postgre_client().get_pool().acquire() as connection:
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

    def get_config(self):
        return self.config

    def get_ping(self):
        return self.user.latency

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
