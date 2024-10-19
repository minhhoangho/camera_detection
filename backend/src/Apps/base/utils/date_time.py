from contextlib import suppress
from datetime import datetime
import pytz
from time import mktime
from src.Apps.base.logging.application_log import AppLog
from src.Apps.base.utils.main import Utils
from django.utils.formats import date_format
from pytz import country_timezones
from phonenumbers import parse as pn_parse
import re
from dateutil.parser import parse as dateutil_parse
from phonenumbers import timezone as pn_timezone

from src.Apps.base.utils.type_utils import TypeUtils

UTC_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S+00:00"
YYYMMDD_DATE_FORMAT = "%Y-%m-%d"
YYYMMDDHHMMSS_DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
UTC_MILLISECONDS_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%f+00:00"
YYYMMDDHHMMSS_MILLISECONDS_DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%S.%f"
MIL_UTC_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
USER_ACCESS_DATE_FORMAT = "%b %d, %Y  %I:%M%P"
TIME_AM = "am"
TIME_PM = "pm"


class DateTimeUtils:
    FORMAT_DATE_PATTERN_YYYYMMDD = "%Y/%m/%d"
    FORMAT_DATE_PATTERN_MMDDYYYY = "%m/%d/%Y"
    FORMAT_DATE_PATTERN_Y_M_D_H_M_S = "%Y-%m-%d %H:%M:%S"
    FORMAT_DATE_PATTERN_M_D_Y_H_M_S_SLASH = "%m/%d/%Y %H:%M:%S"
    FORMAT_DATE_PATTERN_M_D_Y = "M d, Y"
    FORMAT_DATE_PATTERN_D_M_Y = "d M, Y"
    FORMAT_DATE_PATTERN_YYYY_MM_DD = "%Y-%m-%d"

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
            dt_object = cls.parse_res_date(dt_input)
        return dt_object.strftime("%Y%m%d%H%M%S%f")[:-3]

    @classmethod
    def parse_res_date(cls, date):
        """
        Try to convert a string datetime to object datetime with strange format
        :param date:
        Returns: Object DateTime
        """
        with suppress(Exception):
            return datetime.strptime(date, "%Y-%m-%dT%H:%M:%S%fZ")
        return dateutil_parse(date, fuzzy=True)

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

    @classmethod
    def timezone_in_minutes(cls, tz_str):
        res = 0
        try:
            dt = datetime.utcnow()
            utc_tz = pytz.timezone("UTC")
            dt0 = cls.convert_timezone(dt, tz_str).replace(tzinfo=utc_tz)
            dt = cls.convert_timezone(dt, "UTC").replace(tzinfo=utc_tz)
            time_diff = dt0 - dt
            res = (time_diff.seconds // 60) + time_diff.days * 24 * 60
        except Exception as e:
            AppLog.project.error(e)
        return res

    @classmethod
    def convert_datetime(cls, time_convert, time_zone, to_timezone="UTC", day_time="min", return_datetime_obj=False):
        if not isinstance(time_convert, datetime):
            time_convert = datetime.strptime(time_convert, cls.FORMAT_DATE_PATTERN_Y_M_D_H_M_S)
        if day_time == "min":
            time_convert = time_convert.replace(hour=0, minute=0, second=0)
        elif day_time == "max":
            time_convert = time_convert.replace(hour=23, minute=59, second=59)
        time_convert = cls.convert_timezone(time_convert, from_timezone=time_zone, to_timezone=to_timezone)
        if return_datetime_obj:
            return time_convert
        return datetime.strftime(time_convert, cls.FORMAT_DATE_PATTERN_Y_M_D_H_M_S)

    @staticmethod
    def convert_timezone(datetime_value, to_timezone, from_timezone="UTC"):
        """
        @param from/to_timezone: element in pytz.all_timezones. ex: Asia/Ho_Chi_Minh
        """
        with suppress(Exception):
            _datetime_value = datetime_value.replace(tzinfo=None)
            _from_timezone = pytz.timezone(from_timezone)
            _to_timezone = pytz.timezone(to_timezone)
            result = _from_timezone.localize(_datetime_value).astimezone(_to_timezone)
            return result
        return datetime_value

    @classmethod
    def parse_date(cls, date_string, format="%Y%m%d", to_timezone=None, use_l10n=False):
        try:
            date_value = dateutil_parse(date_string)
            if to_timezone:
                # Convert to a specific timezone time before parse to string
                date_value = cls.convert_timezone(date_value, to_timezone=to_timezone, from_timezone="UTC")
            if use_l10n:
                return date_format(date_value, format, use_l10n=True)
            return date_value.strftime(format)
        except Exception as e:
            AppLog.error_exception(e)
        return ""

    @classmethod
    def parse_string_to_date(cls, date):
        with suppress(Exception):
            year, month, day = (int(x) for x in date.split(","))
            return datetime(year, month, day)
        return None

    @classmethod
    def parse_date_string_to_datetime(cls, date_str):
        with suppress(Exception):
            return dateutil_parse(date_str)
        return None

    @classmethod
    def convert_day_string_to_utc(cls, day_str, time_str, tz_str="US/Arizona"):
        # day_str format as YYYY-MM-dd
        # time str format at HH:MM
        _timezone = pytz.timezone(tz_str)
        date_time_str = f"{day_str} {time_str}:00"
        date_time_obj = datetime.strptime(date_time_str, "%Y-%m-%d %H:%M:%S")
        datetime_at_time_zone = _timezone.localize(date_time_obj)

        # The datetime saving on DB should be convert from approval choose timezone to UTC
        return datetime_at_time_zone.astimezone(pytz.utc)

    @classmethod
    def get_tz(cls, phone_number, default=None):
        with suppress(Exception):
            x = pn_parse(phone_number)
            tz = pn_timezone.time_zones_for_number(x)
            tz = tz[0]
            # this data AREA_CODE_LOCATOR just support for US/CA phone numbers
            # TODO: need review this method more
            if x.country_code == 1:
                number = str(x.national_number)
                area_code = TypeUtils.safe_int(number[: (1 + 2)])
                tz_by_areacd = None
                if tz_by_areacd:
                    for tz_str in country_timezones.get("US", []) + country_timezones.get("CA", []):
                        city = re.sub("_", " ", tz_str.split("/")[-1])
                        if city in tz_by_areacd:
                            tz = tz_str
                            break
            return tz
        return default or pytz.utc.zone

    @classmethod
    def time_to_24h(cls, time_str, meridiem):
        """
        :param time_str: time string format HH:MM (12:22)
        :type time_str: str
        :param meridiem: AM
        :type meridiem: str
        :return: time string
        :rtype: str
        """
        # Convert time_str to 24h
        try:
            time_str_with_meridiem = f"{time_str} {meridiem.upper()}"
            date_time_24h = datetime.strptime(time_str_with_meridiem, "%I:%M %p")
            return datetime.strftime(date_time_24h, "%H:%M")
        except Exception as ex:
            AppLog.project.exception(ex)

    @staticmethod
    def safe_timezone(timezone_str, default="UTC"):
        result = default
        try:
            result = pytz.timezone(timezone_str).zone
        except Exception as e:
            AppLog.project.info(e)
        return result

    @staticmethod
    def safe_date(date_str, date_format):
        result = ""
        try:
            result = datetime.strptime(date_str, date_format)
        except Exception as e:
            AppLog.project.info(e)
        return result

    @classmethod
    def safe_date_str(cls, date_str, date_format):
        safe_date = cls.safe_date(date_str, date_format)
        if safe_date:
            return safe_date.strftime(date_format)
        return ""

    @staticmethod
    def safe_format_date(date, date_format, default=""):
        with suppress(Exception):
            return date.strftime(date_format)
        return default

    @staticmethod
    def dt_to_milliseconds(dt):
        if isinstance(dt, datetime):
            sec_since_epoch = mktime(dt.timetuple()) + dt.microsecond / 1000000.0
            return int(sec_since_epoch * 1000)
        return 0

    @staticmethod
    def dt_fr_milliseconds(ms):
        with suppress(Exception):
            return datetime.fromtimestamp(ms / 1000.0)
        return None
