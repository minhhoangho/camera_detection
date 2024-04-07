

from datetime import datetime

import pytz

from src.Apps.base.logging.application_log import AppLog
from src.Apps.base.utils.main import Utils

UTC_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S+00:00"
YYYMMDD_DATE_FORMAT = "%Y-%m-%d"
YYYMMDDHHMMSS_DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
UTC_MILLISECONDS_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%f+00:00"
YYYMMDDHHMMSS_MILLISECONDS_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%f"
MIL_UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
USER_ACCESS_DATE_FORMAT = "%b %d, %Y  %I:%M%P"
TIME_AM = "am"
TIME_PM = "pm"
US_ARIZONA_DEFAULT = "US/Arizona"


class DateTimeUtils:
    @staticmethod
    def get_min_max_dates_in_list(datetime_list):
        min_datetime = ""
        max_datetime = ""
        if not datetime_list:
            return min_datetime, max_datetime
        try:
            datetime_list.sort()
            min_datetime = datetime_list[0]
            if min_datetime:
                min_datetime = min_datetime.strftime(UTC_DATETIME_FORMAT)
            max_datetime = datetime_list[len(datetime_list) - 1]
            if max_datetime:
                max_datetime = max_datetime.strftime(UTC_DATETIME_FORMAT)
        except Exception as e:
            AppLog.error_exception(e, full_trace=False)
        return min_datetime, max_datetime

    @staticmethod
    def is_date_in_dates_range(input_date_time, datetime_list, is_datetime=True):
        if not input_date_time or len(datetime_list) < 2:
            return False

        if not is_datetime:
            input_dt = datetime.combine(input_date_time, datetime.min.time()).astimezone(pytz.utc)
        else:
            input_dt = input_date_time
        return datetime_list[0] <= input_dt <= datetime_list[1]

    @staticmethod
    def str_list_to_datetime_list(datetime_str_list, formatter=UTC_DATETIME_FORMAT):
        datetime_list = []
        for datetime_str in datetime_str_list:
            dt_object = DateTimeUtils.str_to_datetime(datetime_str, formatter)
            if isinstance(dt_object, datetime):
                datetime_list.append(dt_object)
        return datetime_list

    @staticmethod
    def str_to_datetime(datetime_str, formatter=UTC_DATETIME_FORMAT):
        """
        Convert string to datetime
        :param datetime_str:
        :param formatter:
        :return:
        """
        if not datetime_str:
            return ""
        if isinstance(datetime_str, datetime):
            return datetime_str

        utc_dt = ""
        try:
            # Try with specific format
            utc_dt = datetime.strptime(datetime_str, formatter).astimezone(pytz.utc)
        except ValueError:
            # Try with default format
            try:
                utc_dt = datetime.strptime(datetime_str, UTC_DATETIME_FORMAT).astimezone(pytz.utc)
            except Exception as e:
                AppLog.error_exception(e, full_trace=False)
        except Exception as e:
            AppLog.error_exception(e, full_trace=False)
        return utc_dt

    @staticmethod
    def time_ms_to_datetime(time_ms: int):
        max_second = 59
        # Remove microseconds
        date_str = str(time_ms)[:-3]
        second = Utils.safe_int(date_str[-2:])
        if second > 59:
            # Replace second if it's greater than max second
            date_str = date_str[:-2] + str(max_second)
        return DateTimeUtils.str_to_datetime(datetime_str=date_str, formatter="%Y%m%d%H%M%S")

    @classmethod
    def to_12_hours_format(cls, time_start, time_end):
        rs_format = "{} - {}:{}{}"
        rs = ""
        if not time_start or not time_end:
            return rs
        start_arr = time_start.split(":")
        end_arr = time_end.split(":")
        if len(start_arr) < 2 or len(end_arr) < 2:
            return rs
        start_hour = start_arr[0]
        end_hour = end_arr[0]
        if Utils.safe_int(start_hour) <= 12:
            time_start = f"{start_hour}:{start_arr[1]}"
        else:
            time_start = f"{Utils.safe_int(start_hour) - 12}:{start_arr[1]}"

        if Utils.safe_int(end_hour) < 12:
            rs = rs_format.format(time_start, end_hour, end_arr[1], TIME_AM)
        elif Utils.safe_int(end_hour) == 12:
            rs = rs_format.format(time_start, 12, end_arr[1], TIME_PM)
        else:
            rs = rs_format.format(time_start, Utils.safe_int(end_hour) - 12, end_arr[1], TIME_PM)
        return rs

    @classmethod
    def to_hour_min_format(cls, minutes):
        try:
            if minutes:
                minutes = Utils.safe_int(minutes)
                hour, minute = divmod(minutes, 60)
                result = "%02d:%02d" % (hour, minute)
                return result
        except:
            pass
        return ""

    @classmethod
    def only_future_dates(cls, dates):
        future_dates = []
        dt_now = datetime.now(pytz.utc)
        for date_ele in dates:
            if date_ele > dt_now:
                future_dates.append(date_ele)
        return future_dates

    @classmethod
    def to_timestamp_format(cls, dt_input):
        """
        dt_input accept datetime or string
        """
        if isinstance(dt_input, datetime):
            dt_object = dt_input
        else:
            dt_object = Utils.parse_res_date(dt_input)
        return dt_object.strftime("%Y%m%d%H%M%S%f")[:-3]

    @classmethod
    def to_utc(cls, dt_input, timezone):
        if not dt_input:
            return None
        return dt_input.replace(tzinfo=pytz.timezone(timezone)).astimezone(pytz.utc).isoformat()

    @classmethod
    def days_between_dates(cls, from_date, to_date):
        if not isinstance(from_date, datetime):
            from_date = cls.str_to_datetime(from_date, formatter=YYYMMDDHHMMSS_DATETIME_FORMAT)
        if not isinstance(to_date, datetime):
            to_date = cls.str_to_datetime(to_date, formatter=YYYMMDDHHMMSS_DATETIME_FORMAT)
        if not from_date or not to_date:
            return 0
        return (to_date - from_date).days
