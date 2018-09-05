import time

from enum import Enum


class LogLevel(Enum):
    DEBUG = 10
    INFO = 20
    WARN = 30
    ERROR = 40
    CRITICAL = 50


def debug(message):
    log(LogLevel.DEBUG, message)


def info(message):
    log(LogLevel.INFO, message)


def warn(message):
    log(LogLevel.WARN, message)


def error(message):
    log(LogLevel.ERROR, message)


def critical(message):
    log(LogLevel.CRITICAL, message)


def init():
    file = open(f'logs/obstBot_{time.strftime("%d-%m-%Y")}.log', "a")
    own_time = time.strftime("%H:%M:%S")
    init_time = time.strftime("%c")
    file.write(f'[{own_time}] [INFO] ------------------------------------------------------------------\n')
    file.write(f'[{own_time}] [INFO] Initialized logging file while booting on {init_time}\n')


def log(level, message):
    file = open(f'logs/obstBot_{time.strftime("%d-%m-%Y")}.log', "a")
    own_time = time.strftime("%H:%M:%S")
    print(f'[{own_time}] [{level.name}] {message}')
    file.write(f'[{own_time}] [{level.name}] {message}\n')
    file.close()