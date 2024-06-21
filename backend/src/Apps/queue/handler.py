from typing import Tuple, Any

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
    def async_job(cls, job_name: str, params: Tuple, **kwargs):
        """
        This method is used to schedule a job to run asynchronously
        job_name: str: the name of the job to be scheduled
        params: Tuple[Any]: the parameters to be passed to the job
        kwargs: dict: additional keyword arguments
            - timeout: int: the time in seconds after which the job should be terminated
            - delay: int: the time in seconds after which the job should be run

        Usage:
        task_func = "calculate_report"
        module = "analytic"
        task_name = QueueHandler.get_task_path(module, task_func)
        QueueHandler.async_job("calculate_report", params=(1, 2), timeout=10)
        """
        timeout = TypeUtils.safe_int(kwargs.get("timeout", 0))
        delay = TypeUtils.safe_int(kwargs.get("delay", 0))
        extra_kwargs = {}
        if timeout > 0:
            extra_kwargs["timeout"] = timeout

        if not delay:
            async_task(job_name, *params, **extra_kwargs)
        else:
            schedule(
                job_name,
                *params,
                schedule_type=Schedule.ONCE,
                next_run=timezone.now() + timedelta(seconds=delay),
                task_name=job_name,
                **extra_kwargs,
            )

    @classmethod
    def schedule(cls, job_name: str, cron_exp: str, params: Tuple, **kwargs):
        timeout = TypeUtils.safe_int(kwargs.get("timeout", 0))
        extra_kwargs = {}
        if timeout > 0:
            extra_kwargs["timeout"] = timeout

        schedule(
            job_name,
            *params,
            schedule_type=Schedule.ONCE,
            task_name=job_name,
            cron=cron_exp,
            **extra_kwargs,
        )
