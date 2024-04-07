import logging


class SensitiveDataFilter(logging.Filter):
    def __init__(self):
        super().__init__()
        self._patterns = [r"Bearer\s\w", r"Basic\s\w", r"jwt\s\w"]

    def filter(self, record):
        # record.msg = self.sensitive_clean(record.msg)
        # if isinstance(record.args, dict):
        #     for k in record.args.keys():
        #         record.args[k] = self.sensitive_clean(record.args[k])
        # else:
        #     record.args = tuple(self.sensitive_clean(arg) for arg in record.args)
        return True

    def sensitive_clean(self, msg):
        import re

        msg = isinstance(msg, str) and msg or str(msg)
        for pattern in self._patterns:
            msg = re.sub(pattern, "<<***>>", msg)
        # TODO: Improve the patterns and use this to test: python3 manage.py stream_tools -test
        # print("cleaned text", msg)
        return msg
