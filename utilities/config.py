import yaml


class Config:
    def __init__(self):
        with open('config.yml', 'r') as f:
            self.parsed_json = yaml.safe_load(f)

    def get_config(self):
        return self.parsed_json
