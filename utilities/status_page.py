import urllib.parse as urllib

import time
from threading import Timer

from utilities import logger


class StatusPage:
    def __init__(self, config, client):
        self.config = config
        self.api_base = 'https://api.statuspage.io'
        self.client = client
        self.debug = self.client.debug
        logger.info('Initializing system metrics for average ping ...')

    async def init(self):
        if self.client.is_in_debug_mode():
            return 
        headers = {"Content-Type": "application/x-www-form-urlencoded",
                   "Authorization": "OAuth " + self.config["statuspage"]["api_key"]}
        value = int(self.client.latency * 1000)
        params = urllib.urlencode({'data[timestamp]': time.time(), 'data[value]': value})
        async with self.client.session.post(f'{self.api_base}/v1/pages/{self.config["statuspage"]["page_id"]}/metrics/'
                                            f'{self.config["statuspage"]["metric_id"]}'
                                            f'/data.json', headers=headers, data=params) as r:
            if r.status is not 201:
                response = await r.text()
                print(f"Error while sending data to status page {response}")
        Timer(60.0, self.run_loop).start()

    def run_loop(self):
            self.client.loop.create_task(self.init())
