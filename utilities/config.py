import json


class Config:
    def __init__(self):
        with open('config.json', 'r') as f:
            self.parsed_json = json.load(f)

    def get_config(self):
        return self.parsed_json
