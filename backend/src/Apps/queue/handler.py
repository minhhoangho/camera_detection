from django_q.models import Schedule
from datetime import timedelta
from django.utils import timezone
from django_q.tasks import async_task, schedule

from src.Apps.base.utils.type_utils import TypeUtils


class QueueHandler:
    @classmethod
    def get_task_path(cls, module_name: str, task_func: str):
        return "".join(["src.Apps.queue.modules.", module_name, ".tasks.", task_func])

    @classmethod
    def async_job(cls, job_name: str, delay: int = 0, *args, **kwargs):
        """
        This method is used to schedule a job to run asynchronously
        job_name: str: the name of the job to be scheduled
        delay: int: the number of seconds to wait before running the job
        """
        timeout = TypeUtils.safe_int(kwargs.get("timeout", 0))
        extra_kwargs = {}
        if timeout > 0:
            extra_kwargs["timeout"] = timeout

        if not delay:
            async_task(job_name, *args, **extra_kwargs)
        else:
            schedule(
                job_name,
                *args,
                schedule_type=Schedule.ONCE,
                next_run=timezone.now() + timedelta(seconds=delay),
                task_name=job_name,
                **extra_kwargs,
            )

    @classmethod
    def schedule(cls, job_name: str, cron_exp: str, *args, **kwargs):
        timeout = TypeUtils.safe_int(kwargs.get("timeout", 0))
        extra_kwargs = {}
        if timeout > 0:
            extra_kwargs["timeout"] = timeout

        schedule(
            job_name,
            *args,
            schedule_type=Schedule.ONCE,
            task_name=job_name,
            cron=cron_exp,
            **extra_kwargs,
        )
