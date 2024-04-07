

import json
import logging
from datetime import datetime
from typing import Any, Dict


from src.Apps.base.logging.sensitive_filter import SensitiveDataFilter

LOG_WEBAPP = "project"
class _BaseAppLog:
    _logger = None

    def __init__(self):
        pass

    def _prepare_log_message(self, message, prefix=""):
        if prefix:
            message = f"{prefix}: {message}"
        try:
            message = json.dumps(message, indent=4)
        except:
            if hasattr(message, "__dict__"):
                message = message.__dict__
        method_name = ""
        try:
            import inspect

            method_name = inspect.stack()[2][3]
        except:
            pass
        message = f"{method_name}: {message}"
        return message

    def exception(self, exc, full_trace=True, message=None):
        try:
            self._logger.error(exc, exc_info=True, stack_info=full_trace)
            if message:
                self._logger.error(f"{str(message)}")
        except Exception as e:
            self._logger.error(f"ERROR: {str(e)} -> {str(exc)}")

    def error(self, error_obj, prefix=""):
        if isinstance(error_obj, Exception):
            self.exception(error_obj)
        else:
            message = self._prepare_log_message(error_obj, prefix)
            self._logger.error(message)

    def info(self, message, prefix=""):
        message = self._prepare_log_message(message, prefix)
        self._logger.info(message)

    def warn(self, message, prefix="", exc_info=True):
        message = self._prepare_log_message(message, prefix)
        self._logger.warning(message, exc_info=exc_info)

    def critical(self, message, prefix="", exc_info=True):
        message = self._prepare_log_message(message, prefix)
        self._logger.critical(message, exc_info=exc_info)

    def debug(self, message, prefix="", exc_info=True):
        message = self._prepare_log_message(message, prefix)
        self._logger.debug(message, exc_info=exc_info)

    def log_time_period(self, start_time, prefix=""):
        b = datetime.now()
        msg = f"TIME {str(b - start_time)}"
        message = self._prepare_log_message(msg, prefix)
        self._logger.info(message)

    def log_error_and_notify(
        self,
        error_obj,
        notify_info: Dict[str, Any],
        prefix: str = "",
    ):
        if error_obj:
            self.error(error_obj, prefix=prefix)


class ProjectLog(_BaseAppLog):
    def __init__(self):
        super().__init__()
        self._logger = logging.getLogger(LOG_WEBAPP)
        self._logger.addFilter(SensitiveDataFilter())



class AppLog:

    project = ProjectLog()


    def __init__(self):
        pass

    @staticmethod
    def error_exception(e, full_trace=True):
        # message = AppLog.project._prepare_log_message(str(e), "")
        AppLog.project.exception(e, full_trace=full_trace)

    @staticmethod
    def profile_resource_usage(message=""):
        import os

        import psutil

        mem = psutil.Process(os.getpid()).memory_info()
        if message:
            print(f"--- {message} ---")
        print(
            "CPU: ",
            psutil.cpu_percent(interval=1),
            f"RSS (MB): {mem.rss / 1024 / 1024}",
            "V_Used (MB)",
            psutil.virtual_memory().used / 1024 / 1024,
            "V_Free (MB)",
            psutil.virtual_memory().free / 1024 / 1024,
        )
