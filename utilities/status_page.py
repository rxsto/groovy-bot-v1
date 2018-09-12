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

    def init(self):
        if self.client.is_in_debug_mode():
            return
        logger.info('Initializing system metrics for average ping ...')
        headers = {"Content-Type": "application/x-www-form-urlencoded",
                   "Authorization": "OAuth " + self.config["statuspage"]["api_key"]}
        value = int(self.client.latency * 1000)
        params = urllib.urlencode({'data[timestamp]': time.time(), 'data[value]': value})
        r = await self.client.session.post(f'{self.api_base}/v1/pages/{self.config["statuspage"]["page_id"]}/metrics/'
                                           f'{self.config["statuspage"]["metric_id"]}'
                                           f'/data.json', headers=headers, data=params)
        if r.status_code is not 201:
            print(f"Error while sending data to status page {r.text}")
        Timer(60.0, self.init).start()
