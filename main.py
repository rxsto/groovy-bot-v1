#!/usr/bin/python3.7

import os
import sys

import discord
from discord.ext import commands
from discord.ext.commands.errors import CommandNotFound
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

logger.init()


async def get_server_prefix(bot: commands.AutoShardedBot, message: discord.Message):
    if not message.guild:
        return prefix
    response = await postgre_client.get_conn().fetchrow(f'SELECT prefix FROM guilds WHERE id = {message.guild.id}')
    custom_prefix = response["prefix"]
    result = commands.when_mentioned_or(custom_prefix)(bot, message)
    result.append(prefix)
    return result


def abort():
    return


client = commands.AutoShardedBot(
    command_prefix=get_server_prefix,
    case_insensitive=True,
    command_not_found=abort
)

logger.info('Starting Groovy ...')

config = Config().get_config()

postgre_client = PostgreClient(config['database']['user'], config['database']['password'],
                               config['database']['database'], config['database']['host'])


@client.event
async def on_ready():
    logger.info(f'Logged in as {client.user} ...')
    await init()
    GameAnimator(client, client.loop).run()
    status_page.StatusPage(config, client).init()


@client.event
async def on_shard_ready(shard_id):
    logger.info(f'Shard {shard_id + 1} is ready!')


@client.event
async def on_guild_join(guild):
    logger.info(f'[Shard {guild.shard_id + 1}] Joined guild {guild.name} ({guild.id}) with {guild.member_count} users')


@client.event
async def on_guild_remove(guild):
    logger.info(f'[Shard {guild.shard_id + 1}] Left guild {guild.name} ({guild.id}) with {guild.member_count} users')


@client.event
async def on_message(msg):
    if msg.author.bot:
        return

    if msg.channel is discord.ChannelType.private:
        return await msg.channel.send(':v: Hey mate, if you want to use me, just invite me to your server! See ya!')

    if len(msg.content.split(' ')) == 1 and msg.content.startswith(f'<@{client.user.id}>'):
        await msg.channel.send(':vulcan: Wazzup mate, my name is Groovy and you can control me with **`.`**')

    async def run_command():

        logger.info(
            f'{msg.content} » {msg.author.name}#{msg.author.discriminator}'
            f' in #{msg.channel.name} on {msg.guild.name} ({msg.guild.id})'
        )
        try:
            await client.process_commands(msg)
        except CommandNotFound:
            return

    await run_command()


@client.event
async def on_command_error(ctx, error):
    logger.error(error)


async def init():
    dirname = os.path.dirname(__file__)
    filename = os.path.join(dirname, 'cogs/')
    extensions = os.listdir(filename)

    logger.info('Started loading cogs ...')

    for file in extensions:
        if file.startswith('__'):
            logger.warn(f'There is a file or dir in /cogs/ which is no cog: {file}')
        else:
            cog = file.split('.')[0]
            client.load_extension(f'cogs.{cog}')
            logger.info(f'Successfully loaded cog {cog}!')
    await postgre_client.connect()


logger.info('Logging in ...')

if debug is True:
    client.run(config['test_bot']['token'])
else:
    client.run(config['main_bot']['token'])


def get_config():
    return config


def get_ping():
    return client.latency
