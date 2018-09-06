#!/usr/bin/python3.7

import asyncio
import os
import sys

import aiohttp
import discord
import datetime

from discord.ext import commands
from discord.ext.commands.errors import CommandNotFound, UserInputError
from utilities import logger, status_page
from utilities.game_animator import GameAnimator
from utilities.config import Config
from utilities.database import PostgreClient

if '--test-run' in sys.argv:
    exit(0)

debug = True

if debug is True:
    prefix = 'gt!'
else:
    prefix = 'g!'


class Groovy(commands.AutoShardedBot):

    async def get_server_prefix(self, bot: commands.AutoShardedBot, message: discord.Message):
        if not message.guild:
            return prefix
        async with self.postgre_client.get_pool().acquire() as connection:
            response = await connection.fetchrow(
                f'SELECT prefix FROM guilds WHERE id = {message.guild.id}')
            if response is None:
                await connection.execute(
                    f'INSERT INTO guilds (id, prefix, volume) VALUES ({message.guild.id}, \'g!\', 100)')
                custom_prefix = 'g!'
            else:
                custom_prefix = response["prefix"]
            result = commands.when_mentioned_or(custom_prefix)(bot, message)
            result.append(prefix)
            return result

    def abort(self):
        return

    def __init__(self):
        super().__init__(command_prefix=self.get_server_prefix, case_insensitive=True)
        logger.init()
        logger.info('Logging in ...')

        logger.info('Starting Groovy ...')

        self.config = Config().get_config()

        self.postgre_client = PostgreClient(self.config['database']['user'], self.config['database']['password'],
                                            self.config['database']['database'], self.config['database']['host'])

        asyncio.get_event_loop().run_until_complete(self.postgre_client.connect())

        if debug is True:
            self.run(self.config['test_bot']['token'])
        else:
            self.run(self.config['main_bot']['token'])

    async def on_ready(self):
        logger.info(f'Logged in as {self.user.name} ...')
        await self.init()
        GameAnimator(self, self.loop).run()
        status_page.StatusPage(self.config, self).init()

    async def on_shard_ready(self, shard_id):
        logger.info(f'Shard {shard_id + 1} is ready!')

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
                            f'Shard: {guild.shard_id}'
            ).set_thumbnail(url=guild.icon_url))
            async with self.postgre_client.get_pool().acquire() as connection:
                await connection.execute(
                    f'INSERT INTO guilds (id, prefix, volume) VALUES ({guild.id}, \'g!\', 100)')

    async def on_guild_remove(self, guild):
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
                            f'Shard: {guild.shard_id}'
            ).set_thumbnail(url=guild.icon_url))
            async with self.postgre_client.get_pool().acquire() as connection:
                await connection.execute(f'DELETE FROM guilds WHERE id = {guild.id}')

    async def on_message(self, msg):
        if msg.author.bot:
            return

        if msg.channel is discord.ChannelType.private:
            return await msg.channel.send(':v: Hey mate, if you want to use me, just invite me to your server! See ya!')

        if len(msg.content.split(' ')) == 1 and msg.content.startswith(f'<@{self.user.id}>'):
            prefixes = await self.get_server_prefix(self, msg)
            await msg.channel.send(f':vulcan: Wazzup mate, my name is Groovy and you can control me with '
                                   f'**`{prefixes[2]}`**')

        try:
            await self.process_commands(msg)
        except CommandNotFound:
            return

    async def on_command_completion(self, ctx):
        logger.info(
            f'{ctx.message.content} » {ctx.message.author.name}#{ctx.message.author.discriminator}'
            f' in #{ctx.message.channel.name} on {ctx.message.guild.name} ({ctx.message.guild.id})'
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

    def get_config(self):
        return self.config

    def get_ping(self):
        return self.user.latency

    def get_postgre_client(self):
        return self.postgre_client


if __name__ == '__main__':
    instance = Groovy()
