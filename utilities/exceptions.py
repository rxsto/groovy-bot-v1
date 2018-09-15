class OwnerOnlyException(Exception):
    def __init__(self):
        super(OwnerOnlyException, self).__init__()


class PremiumOnlyException(Exception):
    def __init__(self, needed_pledge):
        super(PremiumOnlyException, self).__init__()
        self.needed_pledge = needed_pledge
