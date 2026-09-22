import os

from .base import *

env = os.environ.get("EN_ROUTE_ENV")
print(env)

if env == "prod":
    from .prod import *

else:
    from .dev import *
