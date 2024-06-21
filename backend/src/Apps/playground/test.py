import django
import os
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")

if __name__ == "__main__":
    django.setup()
    print("Hello World!")
    print("Django Settings: ", settings.Q_CLUSTER)
    from src.Apps.queue.handler import QueueHandler

    task_func = "calculate_report"
    module = "analytic"
    task_name = QueueHandler.get_task_path(module, task_func)
    QueueHandler.async_job(task_name, params=(1, 2))
