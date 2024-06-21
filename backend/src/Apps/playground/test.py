import django
import os
from django.conf import settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "src.settings")


if __name__ == "__main__":
    django.setup()
    print("Hello World!")
    print("Django Settings: ", settings.Q_CLUSTER)
    from django_q.tasks import async_task
    async_task('src.Apps.system.tasks.calculate_report', task_name='calculate_report')

