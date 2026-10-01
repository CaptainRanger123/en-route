import pytz
import threading
import datetime as dt

logger_lock = threading.Lock()


class Logger:
    def __init__(self, db):
        self.db = db

    def log(self, message, level, user_id, sn, log_in_file=True):
        global logger_lock

        with logger_lock:
            now = dt.datetime.now(tz=pytz.timezone("Asia/Kolkata")).replace(microsecond=0)

            if log_in_file:
                self.db.add_log(now, message, level, sn, user_id)

            print(f"{now.strftime('%c')}\t[{level.upper()}]\t{message}")
