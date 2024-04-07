from datetime import datetime

from croniter import croniter


class CronJobUtils:
    @staticmethod
    def get_latest_cronjob_time(now, cron_time, max_latency=60):
        """
        :param now: datetime.datetime(2021, 6, 23, 4, 32, 12, 490379)
        :param cron_time: "*/1 * * * *"
        :param max_latency: 60  # 1 minute, should be the minimum interval
        :return: datetime.datetime(2021, 6, 23, 4, 32)
        """
        latest_run_time = croniter(cron_time, now).get_prev(datetime)
        latency = (now - latest_run_time).total_seconds()
        latest_run_time = latest_run_time if latency < max_latency else None
        return latest_run_time
