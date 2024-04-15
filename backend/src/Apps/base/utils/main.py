import base64
import re
import string
import urllib.parse
from base64 import b64decode, b64encode
from collections import OrderedDict
from contextlib import suppress
from datetime import datetime, timedelta
from decimal import Decimal
from hashlib import sha1
from itertools import combinations, filterfalse
from json import dumps as json_dumps
from json import loads as json_loads
from math import floor
from pprint import PrettyPrinter
from random import SystemRandom, randint
from random import sample as rd_sample
from re import split as re_split
from string import punctuation
from types import FunctionType
from typing import Any, Type
from urllib.parse import urlparse, urlunparse

import pytz
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.core.serializers import base, python
from django.core.validators import validate_email, validate_ipv46_address
from django.db.models import QuerySet
from django.forms.models import model_to_dict
from django.utils.encoding import force_bytes, force_str
from django.utils.functional import Promise
from django.utils.text import format_lazy
from django.utils.timesince import timesince
from django.utils.translation import gettext_lazy
from django.utils.translation import gettext_lazy as _
from django.utils.translation import gettext_noop, npgettext_lazy
from furl import furl
from html2text import HTML2Text
from jsonschema import validate as validate_schema
from lxml import etree
from phonenumbers import PhoneNumberFormat, format_number
from phonenumbers import parse as pn_parse
from phonenumbers import region_code_for_country_code
from pytz import country_timezones
from urlextract import URLExtract

from src.Apps.base.constants.device import DeviceType
from src.Apps.base.logging.application_log import AppLog
from src.Apps.base.utils.dicttoxml import dicttoxml
from src.Apps.base.utils.type_utils import TypeUtils


class Utils:
    MAX_PAGE_SIZE = 100
    DEFAULT_PAGE_SIZE = 20

    @staticmethod
    def base64_encode(data):
        return force_str(b64encode(force_bytes(data)))

    @staticmethod
    def base64_decode(data):
        return force_str(b64decode(force_bytes(data)))

    @staticmethod
    def is_success_request(response):
        status_code = response.status_code
        return 200 <= status_code < 300

    @staticmethod
    def is_valid_url(url: str) -> bool:
        """
        Check a vaild url link
        :param url: url
        :type url: str
        :return: True if vaild
        :rtype: bool
        """
        try:
            from django.core.validators import URLValidator

            validate = URLValidator()
            validate(url)
        except ValidationError:
            return False
        except Exception:
            return False
        return True

    @staticmethod
    def list_unique(duplicated_list):
        """
        Deduplicate and don't care about the order
        """
        return list(set(duplicated_list))

    @staticmethod
    def list_deduplicate(seq, key=None):
        """
        Deduplicate and keep the order
        """
        seq = list(seq)
        seen = set()
        seen_add = seen.add
        if seq and isinstance(seq[0], dict):
            if not key:
                raise ValueError("List of dict required: key")
            return [x for x in seq if not (x[key] in seen or seen_add(x[key]))]
        return [x for x in seq if not (x in seen or seen_add(x))]

    @staticmethod
    def is_unicode(str_text):
        if isinstance(str_text, str):
            return True
        return None

    @staticmethod
    def clean_zipcode(text):
        with suppress(Exception):
            reg = re.compile(r"^.*(?P<zipcode>\d{5}).*$")
            match = reg.match(text)
            return match.groupdict()["zipcode"]
        return False

    @staticmethod
    def get_english_vowel_prefix(word):
        vowels = ("a", "e", "i", "o", "u")
        return gettext_noop("an") if word[0] in vowels else gettext_noop("a")

    @classmethod
    def add_vowel(cls, word, prefix=""):
        vowel_prefix = gettext_lazy(cls.get_english_vowel_prefix(word))
        if prefix:
            return format_lazy("{0} {1} {2}", vowel_prefix, prefix, word)
        return format_lazy("{0} {1}", vowel_prefix, word)

    @staticmethod
    def replace_punctuation(str_data, allow_punc=None, replace_by=" "):
        allow_punc = allow_punc or []
        if str_data:
            punc_list = set(string.punctuation)
            for punc_char in punc_list:
                if punc_char in allow_punc:
                    continue
                str_data = str_data.replace(punc_char, replace_by)
        str_data = str_data.strip()
        if replace_by == " ":
            str_data = re.sub(" +", replace_by, str_data)
        return str_data

    @staticmethod
    def replace_special_characters(str_data, replace_by=" ", exclude="", to_lower=False, regex=""):
        """
        This function used to replace all special characters to replace by
        :return:
        """
        try:
            regex = regex or f"[^\\w'{exclude}]"
            str_array = re.split(regex, str_data)
            str_data = replace_by.join(str_array)
            if to_lower:
                str_data = str_data.lower()
        except Exception as exception:
            AppLog.error_exception(exception)
        return str_data

    @staticmethod
    def is_normal_letters(text: str) -> bool:
        regex = rf"[A-Za-z0-9\s{string.punctuation}]+"
        pattern = re.compile(regex)
        return bool(pattern.fullmatch(text))

    @staticmethod
    def strip_non_ascii(string):
        """Returns the string without non ASCII characters"""
        stripped = (c for c in string if 0 < ord(c) < 127)
        return "".join(stripped)

    @staticmethod
    def count_words(strs):
        r = re.compile(rf"[{punctuation}]")
        new_strs = r.sub(" ", strs)
        return len(new_strs.split())

    @staticmethod
    def split_words(strs):
        r = rf"^[^\w]*|[{punctuation}]*$"
        new_strs = re.sub(r, " ", strs, re.UNICODE)
        return new_strs.split()

    @staticmethod
    def remove_spaces(val: str):
        return val.translate(str.maketrans("", "", string.whitespace))

    @staticmethod
    def safe_extract_int(val, default=0):
        with suppress(Exception):
            text = re.sub(r"[^0-9]", "", val)
            return int(text)
        return default

    @staticmethod
    def safe_regex(regex_pattern, message):
        try:
            return re.sub(regex_pattern, "", str(message))
        except Exception as e:
            AppLog.project.error(f"regex_pattern/message: {regex_pattern}/{message}")
            AppLog.error_exception(e)
            return message

    @staticmethod
    def safe_unicode(obj, *args):
        """return the unicode representation of obj"""
        with suppress(Exception):
            return str(obj)
        return ""

    @staticmethod
    def safe_bool(val, default=False):
        TRUE_VALUES = ("yes", "true", "on", "1")
        FALSE_VALUES = ("no", "false", "off", "0")
        val = str(val).lower()
        if val in TRUE_VALUES:
            return True
        elif val in FALSE_VALUES:
            return False
        return default

    @staticmethod
    def safe_qdict_to_dict(query_dict, default={}):
        with suppress(Exception):
            return query_dict.dict().copy()
        return query_dict.copy() or default

    @staticmethod
    def safe_getlist(query_dict, key, default=None):
        default = default or []
        with suppress(Exception):
            return query_dict.getlist(key)
        return query_dict.get(key) or default

    @staticmethod
    def lower_list(target_list, default=None):
        with suppress(Exception):
            return [item.lower() for item in target_list]
        return default or []

    @staticmethod
    def safe_ip_address(ip_addr, default=""):
        try:
            validate_ipv46_address(ip_addr)
            return ip_addr
        except ValidationError:
            return default

    @staticmethod
    def http_safe_quote(http_param):
        with suppress(Exception):
            if http_param:
                return urllib.parse.quote(http_param)
        return http_param

    @staticmethod
    def http_safe_unquote(http_param):
        with suppress(Exception):
            if http_param:
                return urllib.parse.unquote(http_param)
        return http_param

    @staticmethod
    def add_scheme(domain_str, scheme="http://"):
        if settings.APP_SSL:
            scheme = "https://"
        if domain_str:
            match = re.match("(?:http|https)://", domain_str)
            if not match:
                domain_str = f"{scheme}{domain_str}"
            return domain_str
        return None

    @staticmethod
    def find_all_placeholders(text):
        with suppress(Exception):
            return re.findall(r"{(\w+)}", text)
        return []

    @staticmethod
    def id_generator(size=6, salt=""):
        prefix = ""
        if salt:
            prefix = int(sha1(salt.encode("utf-8")).hexdigest(), 16) % (10 ** 8)
        ran_str = "".join(SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(size))
        return f"{prefix}{ran_str}"

    @staticmethod
    def num_generator(size=6, salt=""):
        prefix = ""
        if salt:
            prefix = int(sha1(salt.encode("utf-8")).hexdigest(), 16) % (10 ** 8)
        ran_str = "".join(SystemRandom().choice(string.digits) for _ in range(size))
        return str(prefix) + ran_str

    @staticmethod
    def password_generator(size=8):
        source = "abcdefghijklmnopqrstuvwxyz123456789ABCDEFGHIJKLMNPQRSTUVWXYZ!@#$%^&*()?"
        return "".join(rd_sample(source, size))

    @staticmethod
    def short_name(name):
        words = name.upper().split()
        fchar_each_words = [w[0] for w in words if w[0].isalpha()]
        return "".join(fchar_each_words[:2])

    @staticmethod
    def dump(v):
        if isinstance(v, OrderedDict):
            v = dict(v)
        if v is None:
            raise ValueError()
        with suppress(Exception):
            return print(json_dumps(v, indent=4))
        pp = PrettyPrinter(indent=4)
        pp.pprint(getattr(v, "__dict__", v))

    @staticmethod
    def age(value, to_mins=False):
        """
        Return age in days, mins, seconds and the difference in seconds
        """
        now = datetime.now()
        seconds_diff = 0
        age_to_display = _("just now")
        difference = 0
        with suppress(Exception):
            difference = now - value
            seconds_diff = (difference).total_seconds()
        if difference and timedelta(minutes=1) > difference:
            vage = timesince(value).split(", ")[0]
            vage = vage.replace("minutes", "m").replace("minute", "m")
            vage = vage.replace("days", "d").replace("day", "d")
            vage = vage.replace("hours", "h").replace("hour", "h")
            age_to_display = vage
        return age_to_display, seconds_diff

    @staticmethod
    def xml2dict(val, default=None):
        with suppress(Exception):
            from xmltodict import parse

            return parse(val)
        return {} if default is None else default

    @staticmethod
    def is_valid_latlng(lat, lng):
        infinity = Decimal("0E-7")
        if lat is None or lng is None:
            return False
        if infinity in [lat, lng]:
            return False
        if lat < -90 or lat > 90:
            return False
        if lng < -180 or lng > 180:
            return False
        return True

    @staticmethod
    def get_url(request):
        """
        Since we might be hosted behind a proxy, we need to check the
        X-Forwarded-Proto, X-Forwarded-Protocol, or X-Forwarded-SSL headers
        to find out what protocol was used to access us.
        """
        protocol = request.headers.get("X-Forwarded-Proto") or request.headers.get("X-Forwarded-Protocol")
        if protocol is None and request.headers.get("X-Forwarded-Ssl") == "on":
            protocol = "https"
        if protocol is None:
            return request.url
        url = list(urlparse(request.url))
        url[0] = protocol
        return urlunparse(url)

    @staticmethod
    def json_safe(string, content_type="application/octet-stream"):
        """Returns JSON-safe version of `string`.
        If `string` is a Unicode string or a valid UTF-8, it is returned unmodified,
        as it can safely be encoded to JSON string.
        If `string` contains raw/binary data, it is Base64-encoded, formatted and
        returned according to "data" URL scheme (RFC2397). Since JSON is not
        suitable for binary data, some additional encoding was necessary; "data"
        URL scheme was chosen for its simplicity.
        """
        try:
            string = string.decode("utf-8")
            _encoded = json_dumps(string)
            return _encoded
        except (ValueError, TypeError):
            return b"".join([b"data:", content_type, b";base64,", b64encode(string)]).decode("utf-8")

    @staticmethod
    def remove_soft_hyphen(text):
        return text.replace("\u00ad", "")

    @staticmethod
    def search_json_object_in_array(root_array, key, val):
        return next((obj for obj in root_array if obj[key] == val), {})

    @staticmethod
    def normalize_str(v, to_lower=False):
        with suppress(Exception):
            v = str(v)
            v = v.strip()
            v = re.sub(r"\s+", " ", v)
            if to_lower:
                v = v.lower()
            return v
        return ""

    @staticmethod
    def remove_numbers(v):
        with suppress(Exception):
            v = str(v)
            v = v.strip()
            v = re.sub(r"[0-9]", "", v)
            return v
        return ""

    @staticmethod
    def list_get(_list, idx, default=None):
        with suppress(Exception):
            return _list[idx]
        return default

    @staticmethod
    def list_diff(base_list, list_has_diff):
        """
        Return a list containing elements that are in list_has_diff but not in base_list
        """
        return list(set(list_has_diff) - set(base_list))

    @staticmethod
    def common_list(l1, l2):
        """
        Return common elements between two lists
        """
        return list(set(l1) & set(l2))

    @staticmethod
    def list_dict_diff(l1, l2):
        """
        Return a list containing dictionary elements that have different between 2 list
        """
        return list(filterfalse(lambda x: x in l1, l2)) + list(filterfalse(lambda x: x in l2, l1))

    @staticmethod
    def text2weekday(weekday_str):
        try:
            mapping_weekday_text = {"mon": 0, "tue": 1, "wed": 2, "thu": 3, "fri": 4, "sat": 5, "sun": 6}
            return mapping_weekday_text.get(weekday_str)
        except Exception as e:
            AppLog.error_exception(e)
        return None

    @staticmethod
    def can_be_phone_number(text):
        list_number = re.findall(r"\d+", text)
        str_number = "".join(list_number)
        return len(str_number) >= 6

    @staticmethod
    def dict_get(d, path, default=None):
        with suppress(Exception):
            v = d
            for key in path:
                v = v[key]
            return v
        return default

    @staticmethod
    def is_sub_dict(subdict, superdict):
        return all(item in superdict.items() for item in subdict.items())

    @staticmethod
    def is_sub_list(sublist, superlist):
        return all(elem in superlist for elem in sublist)

    @staticmethod
    def gen_camelcase_slug(s):
        if isinstance(s, str):
            s = re.sub(r"[^A-Za-z0-9\s_\-\/,\(\)\.]", "", s)
            s = re.sub(r"_+", " ", s)
            s = re.sub(r"\-+", " ", s)
            s = re.sub(r"\/+", " ", s)
            s = re.sub(r",+", " ", s)
            s = re.sub(r"\(+", " ", s)
            s = re.sub(r"\)+", " ", s)
            s = re.sub(r"\.+", " ", s)
            s = re.sub(r"\s+", " ", s)
            s = s.strip()
            if s:
                s = "".join(part[0].upper() + part[1:] for part in s.split(" "))
                s = urllib.parse.quote(s.encode("utf-8"))
                return s
            return s
        return ""

    @staticmethod
    def gen_slug(s):
        if isinstance(s, str):
            s = s.lower()
            s = re.sub(r"[^A-Za-z0-9\s_\-\/,\(\)]", "", s)
            s = re.sub(r"_+", " ", s)
            s = re.sub(r"\/+", " ", s)
            s = re.sub(r"\-+", " ", s)
            s = re.sub(r",+", " ", s)
            s = re.sub(r"\(+", " ", s)
            s = re.sub(r"\)+", " ", s)
            s = re.sub(r"\s+", " ", s)
            s = s.strip()
            s = re.sub(" ", "-", s)
            s = urllib.parse.quote(s.encode("utf-8"))
            return s
        return ""

    @staticmethod
    def get_public_api_url_for_external(path="", *args, **kwargs):
        if path.startswith("http"):
            return path
        if settings.API_SSL:
            protocol = "https://"
        else:
            protocol = (kwargs.pop("protocol", None) or "http") + "://"
        api_base = kwargs.pop("api_base", None) or settings.API_BASE
        if len(path) and path[0] != "/":
            path = "/" + path
        if kwargs.pop("part", "") == "domain":
            # Return domain
            return api_base
        return protocol + api_base + path

    @staticmethod
    def format_phone_number(phone_number, country=None):
        """
        This method will format phone number to INTERNATIONAL FORMAT.
            "+447821612655"  => '+44 7821 612655'
            "+17821612655"  => '(782) 161-2655'
        Currently this method is working correct with phone number have format like +<country_code> <phone_number>
        :param: phone number - Full international phone nunmber
        :param: country - 2 characters of country. Default is None
        """
        with suppress(Exception):
            if phone_number:
                x = pn_parse(phone_number, country)
                # PhoneNumberFormat.INTERNATIONAL
                # PhoneNumberFormat.NATIONAL
                if x.country_code == 1:
                    # US number
                    return format_number(x, PhoneNumberFormat.NATIONAL)
                internaltion_number = format_number(x, PhoneNumberFormat.INTERNATIONAL)
                return f"{internaltion_number}"
        return phone_number

    @staticmethod
    def spell_number(number):
        if number < 2:
            return ""

        def ordinal(n):
            return "%d%s" % (n, "tsnrhtdd"[(n / 10 % 10 != 1) * (n % 10 < 4) * n % 10:: 4])

        return str(ordinal(number))

    @staticmethod
    def text_2_phone(text):
        phone_number = False
        text = re.sub(r"[^0-9\+]", "", text)
        phone_regex = re.compile(
            r"[+]*(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})(\d*)",
            re.VERBOSE,
        )
        extract_phone_number = phone_regex.search(text)
        if extract_phone_number:
            extract_phone_number = extract_phone_number.group()
            if len(extract_phone_number) > 7:
                phone_number = extract_phone_number
        return phone_number

    @staticmethod
    def is_internation_phone_number(phone_number):
        with suppress(Exception):
            return re.findall(r"\+[ .(]?[1-9][0-9 .\-\(\)]{8,}[0-9]", phone_number)
        return False

    @staticmethod
    def get_phone_number(phone_number, country_iso="US", country_code=True, validate=False):
        """
        This method will convert phone number to INTERNATIONAL FORMAT.
            "+447821612655"  => '+44 7821 612655'
            "+17821612655"  => '(782) 161-2655'
        Currently this method is working correct with phone number have format like +<country_code> <phone_number>
        :param: phone number - Full international phone nunmber
        :param: country - 2 characters of country. Default is None
        NOTE: This method right now using for LOGIN with phone number, which default only support US phone numbers
        TODO: Need to update to support all countries
        """
        with suppress(Exception):
            phone_number = phone_number.replace(".", "").replace(",", "")
            # This method pn_parse will priority checking the phone number first, before checking country code
            # So in-case country code is None or wrong, it still return correct result based on phone number
            x = pn_parse(phone_number, country_iso)
            if country_code:
                return f"+{x.country_code}{x.national_number}"
            return x.national_number
        if validate:
            return False
        return phone_number

    @staticmethod
    def get_country_name(phone_number: str, lang="en"):
        """
        The result might consist of the name of the country where the phone
        number is from and/or the name of the geographical area the phone number
        is from.
        :param phone_number: The phone number
        :param lang: The expected language code for the result
        :return:
        """
        with suppress(Exception):
            from phonenumbers import geocoder

            phone_parse = pn_parse(phone_number)
            return geocoder.description_for_number(phone_parse, lang)
        return ""

    @staticmethod
    def media_url(media_path):
        if not media_path or not isinstance(media_path, str):
            return ""
        if media_path.startswith("http:") or media_path.startswith("https:"):
            return media_path
        return settings.MEDIA_URL + media_path

    @staticmethod
    def static_url(media_path):
        if not isinstance(media_path, str):
            return ""
        if media_path.startswith("http:") or media_path.startswith("https:"):
            return media_path
        return settings.STATIC_URL + media_path

    @staticmethod
    def extract_email(text):
        try:
            # https://stackoverflow.com/a/2049510/7181800
            matches = re.search(r"[\w\!#$%&'*+-\/=?^_`{|}~]+@[\w\.-]+(\.\w+)", text)
            email = matches.group(0) if matches else ""
            email.encode("ascii")
            validate_email(email)
            return email
        except Exception as e:
            raise ValidationError(f"extract_email: {text} - {str(e)}")

    @staticmethod
    def extract_emails(text, allow_plus_in_email=False):
        with suppress(Exception):
            email_pattern = r"[\w\.\+-]+@[\w\.-]+" if allow_plus_in_email else r"[\w\.-]+@[\w\.-]+"
            matches = re.findall(email_pattern, text)
            emails = []
            for email in matches:
                if email:
                    if email in emails:
                        continue
                    emails.append(email)
                    # No validation here, because if there is punction at the end of email, it failed
            return emails
        return []

    @staticmethod
    def extract_only_domain_email(input_value, delimiter=",", email_domain=None):
        # Note: #OL-9536: only fetch lead's email
        try:
            if not email_domain:
                email_domain = settings.UNIQUE_EMAIL_DOMAIN
            if "@" not in email_domain:
                email_domain = "@" + email_domain
            email = None
            if input_value:
                val_list = input_value.split(delimiter)
                for temp_str in val_list:
                    # Notes: endswith() maybe failed in case <blah@domain.email>
                    if temp_str and email_domain in temp_str:
                        email = temp_str.strip()
                        break
            return email
        except TypeError:
            AppLog.project.info(f"Extract mail domain error from value: {input_value}")
        return ""

    @staticmethod
    def extract_urls(text, sort_by_length=False):
        extractor = URLExtract()
        urls = extractor.find_urls(text)
        clean_urls = []

        if sort_by_length:
            urls = sorted(urls, key=len, reverse=True)

        for url in urls:
            # noinspection PyUnresolvedReferences
            protocol_index = url.find("http")
            if protocol_index > 0:
                brace_letters = ["{", "(", "["]
                url = url[protocol_index - 1:]
                first_letter = url[:1]
                last_letter_index = 0
                if first_letter in brace_letters:
                    brace_dict = {"{": "}", "(": ")", "[": "]"}
                    last_letter_index = url.rfind(brace_dict[first_letter])
                url = url[1:last_letter_index] if last_letter_index > 0 else url[1:]

            if url[-1:] == ".":
                url = url[:-1]
            clean_urls.append(url)
        return clean_urls

    @staticmethod
    def num2words(number):
        numwords1 = {
            1: "one",
            2: "two",
            3: "three",
            4: "four",
            5: "five",
            6: "six",
            7: "seven",
            8: "eight",
            9: "nine",
            10: "ten",
            11: "eleven",
            12: "twelve",
            13: "thirteen",
            14: "fourteen",
            15: "fifteen",
            16: "sixteen",
            17: "seventeen",
            18: "eighteen",
            19: "nineteen",
        }
        numwords2 = ["twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"]
        ret = 0
        if number in numwords1:
            ret = numwords1[number]
        elif 19 < number < 100:
            tens, below_ten = divmod(number, 10)
            ret = numwords2[tens - 2]
            if below_ten in numwords1:
                ret = f"{ret}-{numwords1[below_ten]}"
        return ret

    @staticmethod
    def clean_data(data):
        if "_state" in data:
            del data["_state"]

        if "created_at" in data:
            data["created_at"] = data["created_at"].isoformat()

        if "updated_at" in data:
            data["updated_at"] = data["updated_at"].isoformat()

        return data

    @staticmethod
    def get_exception_message(e):
        if e.args and len(e.args) > 0:
            return " ".join(str(x) for x in e.args)
        else:
            return str(e)

    @staticmethod
    def encode(clear):
        enc = []
        clear = str(clear)
        for i in range(len(clear)):
            key_c = settings.SECRET_KEY[i % len(settings.SECRET_KEY)]
            enc_c = chr((ord(clear[i]) + ord(key_c)) % 256)
            enc.append(enc_c)
        return base64.urlsafe_b64encode("".join(enc).encode()).decode()

    @staticmethod
    def decode(enc):
        try:
            dec = []
            enc = base64.urlsafe_b64decode(enc).decode()
            for i in range(len(enc)):
                key_c = settings.SECRET_KEY[i % len(settings.SECRET_KEY)]
                dec_c = chr((256 + ord(enc[i]) - ord(key_c)) % 256)
                dec.append(dec_c)
            return "".join(dec)
        except:
            return enc

    @staticmethod
    def sql_convert_tz(db_field, to_tz="US/Arizona", is_redshift=False):
        now = datetime.now(pytz.timezone(settings.TIME_ZONE))
        from_offset = now.astimezone(pytz.timezone(settings.TIME_ZONE)).strftime("%z")
        to_offset = now.astimezone(pytz.timezone(to_tz)).strftime("%z")
        from_offset = ":".join([from_offset[:3], from_offset[3:]])
        to_offset = ":".join([to_offset[:3], to_offset[3:]])
        convert_fnc = (
            f"CONVERT_TIMEZONE('{to_tz}', {db_field})"
            if is_redshift
            else f"CONVERT_TZ({db_field}, '{from_offset}', '{to_offset}')"
        )
        return convert_fnc

    @staticmethod
    def get_client_ip(request):
        """
        Get client ip
        :param request:
        :return: string ip
        """
        if not request:
            return ""
        if request.META.get("HTTP_IP"):
            return request.META.get("HTTP_IP")
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip

    @staticmethod
    def multikeysort(items, columns):
        import functools
        from operator import itemgetter

        comparers = [
            ((itemgetter(col[1:].strip()), -1) if col.startswith("-") else (itemgetter(col.strip()), 1))
            for col in columns
        ]

        def comparer(left, right):
            for fn, mult in comparers:
                result = cmp(fn(left), fn(right))
                if result:
                    return mult * result
            else:
                return 0

        def cmp(a, b):
            return (a > b) - (a < b)

        return sorted(items, key=functools.cmp_to_key(comparer))

    @staticmethod
    def html_cleaner(content):
        import lxml.html.clean as clean

        cleaner = clean.Cleaner(
            page_structure=True,
            meta=True,
            embedded=True,
            links=True,
            style=True,
            processing_instructions=True,
            # inline_style=True,
            scripts=True,
            javascript=True,
            comments=True,
            frames=True,
            forms=True,
            annoying_tags=True,
            remove_unknown_tags=True,
            safe_attrs_only=True,
            safe_attrs=frozenset(["src", "color", "href", "title", "style"]),
            remove_tags=("span", "font"),
        )
        return cleaner.clean_html(content)

    @staticmethod
    def remove_html_tags(text):
        if text:
            clean = re.compile("<.*?>")
            return re.sub(clean, "", text)
        return text

    @staticmethod
    def is_item_in_list(list, item):
        for list_item in list:
            if item and item.strip().lower() == list_item.strip("\u200b").lower():
                return True
        return False

    @staticmethod
    def is_valid_json_schema(json_data, json_schema, is_json_object=True):
        def _lock_schema(schema):
            if "properties" in schema:
                schema.update(additionalProperties=False, required=list(schema["properties"].keys()))
                for property in schema["properties"]:
                    schema["properties"][property] = _lock_schema(schema["properties"][property])
            return schema

        try:
            if not is_json_object:
                json_object = json_loads(json_data)
            else:
                json_object = json_data
            _lock_schema(json_schema)
            validate_schema(json_object, json_schema)
            return True
        except Exception:
            return False

    @staticmethod
    def join_names(list_name, threshold=5, is_people=True, use_lazy=False):
        """
        Data return.
        A
        A and B
        A, B and C
        A, B, C and D
        A, B, C, D and 1 other
        A, B, C, D and +2 others
        """
        _len = len(list_name)
        joined = ""
        if _len:
            _and = gettext_lazy("and")
            if is_people:
                _other = npgettext_lazy("people", "{number} other", "+{number} others", "number")
            else:
                _other = npgettext_lazy("thing", "{number} other", "+{number} others", "number")
            if _len == 1:
                joined = list_name[0]
            elif _len < threshold:
                joined = format_lazy("{} {} {}", ", ".join(list_name[:-1]), _and, list_name[-1])
            elif _len >= threshold:
                joined = format_lazy(
                    "{} {} {}",
                    ", ".join(list_name[: threshold - 1]),
                    _and,
                    format_lazy(_other, number=(_len - (threshold - 1))),
                )

            if use_lazy:
                return joined
        return force_str(joined)

    @staticmethod
    def xml_escape_values(values):
        from xml.sax.saxutils import escape

        escaped_values = {}
        for key, value in values.items():
            escaped_values.update({key: escape(value) if isinstance(value, str) else value})
        return escaped_values

    @staticmethod
    def format_lazy_msg(template, *args, **kwargs):
        """
        format lazy with gettext_noop params
        """
        params = []
        for param in args:
            if isinstance(param, str):
                param = gettext_lazy(param)
            params.append(param)

        for key, val in kwargs.items():
            if isinstance(val, str):
                val = gettext_lazy(val)
            kwargs[key] = val

        return format_lazy(template, *params, **kwargs)

    @staticmethod
    def text_contains_html_tags(text):
        # basic_pattern = '''.*<(.|\n)*?>.*'''
        strong_pattern = r""".*<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE|a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video) .*?>|<(video).*?<\/\2>.*"""
        if re.match(strong_pattern, text):
            return True
        return False

    @staticmethod
    def get_ordinal_numbers_dict(from_number, to_number):
        def ordinal(n):
            return "%d%s" % (n, "tsnrhtdd"[(floor(n / 10) % 10 != 1) * (n % 10 < 4) * n % 10:: 4])

        ord_nums = [ordinal(n) for n in range(from_number, to_number)]
        ret = {}
        for num, ord_num in enumerate(ord_nums, 1):
            ret.update({ord_num: num})
        return ret

    @staticmethod
    def highlight_text(text, keywords=[]):
        if keywords:
            return re.sub(r"({})".format("|".join(keywords)), r"<em>\1</em>", text, flags=re.I)
        return text

    @staticmethod
    def get_country_code_by_timezone(timezone):
        try:
            for country_code in country_timezones:
                timezones = country_timezones[country_code]
                timezones = [tz.lower() for tz in timezones]
                if timezone.lower() in timezones:
                    return country_code
        except Exception as e:
            AppLog.error_exception(e)
        return ""

    @staticmethod
    def find_where(prdicate, ittrable, default=None):
        for item in ittrable:
            if prdicate(item):
                return item
        return default

    @staticmethod
    def is_text_include_select_list(qtext):
        if qtext:
            msg_lines = str(qtext).splitlines()
            last_line = msg_lines[-1]
            if re.match(r"^\s*[0-9]+\.+\s", last_line):
                return True
        return False

    @staticmethod
    def remove_invalid_character(value):
        return "".join([x for x in value if ord(x) < 10175])

    @staticmethod
    def remove_unprintable_characters(text: str) -> str:
        """
        To remove unprintable characters from a given text
        :param text: the invalid text string
        :return: a valid text
        """
        return "".join([x for x in text if x.isprintable()])

    @staticmethod
    def set_difference(list1, list2):
        set2 = frozenset(list2)
        return [x for x in list1 if x not in set2]

    @staticmethod
    def intersect(list1, list2):
        set2 = frozenset(list2)
        return [x for x in list1 if x in set2]

    @staticmethod
    def is_intersect(list1, list2):
        return any(x in list2 for x in list1)

    @staticmethod
    def merge_list(list1, list2):
        return list(set(list1 + list2))

    @staticmethod
    def fixture_safe_load(apps, source, app_label):
        # Save the old _get_model() function
        old_get_model = python._get_model

        # Define new _get_model() function here, which utilizes the apps argument to
        # get the historical version of a model. This piece of code is directly stolen
        # from django.core.serializers.python._get_model, unchanged. However, here it
        # has a different context, specifically, the apps variable.
        def _get_model(model_identifier):
            try:
                return apps.get_model(model_identifier)
            except (LookupError, TypeError):
                raise base.DeserializationError("Invalid model identifier: '%s'" % model_identifier)

        try:
            # Replace the _get_model() function on the module, so loaddata can utilize it.
            python._get_model = _get_model

            # Call loaddata command
            call_command("loaddata", source, app_label=app_label)
        finally:
            # Restore old _get_model() function
            python._get_model = old_get_model

    @staticmethod
    def get_media_url(directory, filename=None):
        media_url = None
        directory = directory.strip("/").replace(f"{settings.MEDIAFILES_LOCATION}/", "")
        if settings.DEBUG:
            media_url = "http://" + settings.PUBLIC_BASE + settings.MEDIA_URL + directory
        else:
            media_url = settings.MEDIA_URL + directory
        if filename:
            media_url += "/" + filename
        return media_url

    @staticmethod
    def random_in_range(from_number, to_number):
        return randint(from_number, to_number)

    @staticmethod
    def format_ip_location_name(country_code, country_name, country_full_name, locale):
        return f"{country_code}, {country_name}, {country_full_name}, {locale}"

    @staticmethod
    def parse_number_to_list(number):
        num_list = []
        for i in range(1, number):
            pow_number = pow(2, i)
            if pow_number > number:
                break
            num_list.append(pow_number)
        if number in num_list:
            return [number]
        else:
            for i in range(1, len(num_list) + 1):
                for result in combinations(num_list, i):
                    if sum(result) == number:
                        return result

    @staticmethod
    def prepare_number_combination_cases(origin_number, combined_numbers):
        """
        Return the list of all numbers can be combined between the origin_number and one or multiple numbers in a list
        :param origin_number: 2
        :param combined_numbers: [4, 8]
        :return: [2, 6, 10, 14]
        """
        _response_numbers = [origin_number]
        for i in range(1, len(combined_numbers) + 1):
            for _result in combinations(combined_numbers, i):
                _combined_number = origin_number + sum(_result)
                if _combined_number not in _response_numbers:
                    _response_numbers.append(_combined_number)
        return _response_numbers

    @staticmethod
    def capitalize_str(str):
        """
        Return a name with uppercase the first letter of each word,
        include the special name with a capital letter in a middle
        (Ex: Leonardo DiCaprio, Dan DiGiacomo, ...)
        :param str
        :return: a name is capitalized
        """
        import re

        return re.sub(r"(^|\s)(\S)", lambda m: m.group(1) + m.group(2).upper(), str)

    @staticmethod
    def percent_format(number):
        return f"{round(number, 2):g}%"

    @staticmethod
    def get_country_alpha3_code(country_code):
        from pycountry import countries

        country = countries.get(alpha_2=country_code)
        return getattr(country, "alpha_3", None)

    @staticmethod
    def get_country_alpha2_code(country_code):
        from pycountry import countries

        country = countries.get(alpha_3=country_code)
        return getattr(country, "alpha_2", None)

    @staticmethod
    def get_set_nested_dict(nested_dict, path, **kwargs):
        """
        Get or Set a nested value of nested dict by path
        :param nested_dict: nested dict object
            {
                "club": [
                {
                    "manager": {
                    "last_name": "Lionel",
                    "first_name": "Messi"
                    }
                }
                ]
            }
        :param path: path to access the nested dict value
            "club[0].manager.first_name"
        :param kwargs: {setter_value: value}
            setter_value='Pulga'
            merge_value_by_delimiter='\n'
        :return: <modified_nested_dict>, getter_value
            ({'club': [{'manager': {'last_name': 'Pulga', 'first_name': 'Messi'}}]}, 'Lionel')

        Example:
        data = {'club': [{'manager': {'last_name': 'Lionel', 'first_name': 'Messi'}}]}

        set_patch = "club[0].manager.middle_name"
        set_value, _ = Utils.get_set_nested_dict(data, set_patch, setter_value='Andres')
        print(set_value)
        >>{'club': [{'manager': {'last_name': 'Lionel', 'first_name': 'Messi', 'middle_name': 'Andres'}}]}

        get_patch = "club[0].manager.middle_name"
        _, get_value = Utils.get_set_nested_dict(data, get_patch)
        print(get_value)
        >>Andres
        """
        try:
            regex_arr_mising_dot_prefix = r"([^\.])(\[)"
            regex_append_dot = r"\1.\2"
            regex_split_by_delimiter = r"[\$,\.]"
            regex_array_format = r"(\[)(\d+)(\])"
            normalized_path = re.sub(regex_arr_mising_dot_prefix, regex_append_dot, path)
            current_node = nested_dict
            getter_value = None
            has_setter = "setter_value" in kwargs.keys() if kwargs else False
            setter_value = kwargs.get("setter_value")
            merge_value_by_delimiter = kwargs.get("merge_value_by_delimiter")

            elements = re.split(regex_split_by_delimiter, normalized_path)
            elements = [element for element in elements if element]
            for index, element in enumerate(elements):
                array_format = re.search(regex_array_format, element)
                key = int(array_format.group(2)) if array_format else element
                if has_setter:
                    if len(elements) - 1 == index:
                        if merge_value_by_delimiter and setter_value:
                            _value = current_node[key] if array_format else current_node.get(key)
                            setter_value = (
                                f"{_value}{merge_value_by_delimiter}{setter_value}" if _value else setter_value
                            )
                            current_node[key] = setter_value
                        else:
                            current_node[key] = setter_value
                    else:
                        # init empty value if index out of range
                        if array_format:
                            number_of_missing_elements = key - len(current_node) + 1
                            if number_of_missing_elements > 0:
                                current_node.extend([{} for _ in range(number_of_missing_elements)])
                        else:
                            if key not in current_node:
                                current_node[key] = {}
                getter_value = current_node[key]
                current_node = getter_value
        except Exception as e:
            if kwargs.get("silent_exception"):
                getter_value = None
            else:
                raise e
        return nested_dict, getter_value

    @staticmethod
    def parse_subdomain_from_url(apply_url):
        subdomain = ""
        with suppress(Exception):
            url_obj = urlparse(apply_url)
            return (url_obj.hostname or "").split(".")[0]
        return subdomain

    @staticmethod
    def first_upper(text):
        """
        This method for updating upper the first character in a string
        """
        if text:
            text = str(text)
            return f"{text[0].upper()}{text[1:]}"
        else:
            return text
        return f"{text[0].upper()}{text[1:]}"

    @classmethod
    def base64_encode_json(cls, s):
        s = cls.safe_json_dumps(s)
        return cls.base64_encode(s)

    @classmethod
    def base64_decode_json(cls, s, default={}):
        s = cls.base64_decode(s)
        return TypeUtils.safe_jsonloads(s, default)

    @classmethod
    def get_page_size(cls, size, min_size=0):
        size = cls.safe_int(size, cls.DEFAULT_PAGE_SIZE)
        if size > cls.MAX_PAGE_SIZE:
            size = cls.MAX_PAGE_SIZE
        if size < min_size:
            size = min_size
        return size

    @classmethod
    def sent_tokenize(cls, text):
        """
        :param text:
        :return: list of sentences
        """
        try:
            return re_split(r"(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s", text)
        except TypeError:
            return []

    @classmethod
    def add_url_params(cls, url, params=None):
        if params is None:
            params = {}
        try:
            url = furl(url).add(params).url
        except Exception as e:
            AppLog.error_exception(e)
        return url

    @classmethod
    def get_url_param(cls, url, param_name, default_value=""):
        try:
            return furl(url).query.params.get(param_name, default_value)
        except Exception as e:
            AppLog.error_exception(e)
        return default_value

    @classmethod
    def update_url_params(cls, url, params={}):
        try:
            furl_obj = furl(url)
            target_params = furl(url).query.params
            for key, value in params.items():
                target_params.update({key: value})
            url = furl_obj.set(target_params).url
        except Exception as e:
            AppLog.error_exception(e)
        return url

    @classmethod
    def query_with_pagination(cls, queryset: QuerySet, **kwargs):
        """
        To get result with pagination
        :param queryset: Queryset
        :param kwargs:
        :return: List
        """
        limit = cls.safe_int(kwargs.get("limit"))
        offset = cls.safe_int(kwargs.get("offset"))
        fields = kwargs.get("fields", ())
        search_ft = kwargs.get("search_ft", None)
        order_by = kwargs.get("order_by", None)
        if search_ft:
            queryset = queryset.filter(search_ft)
        queryset = cls.query_by_fields(queryset, fields)
        if order_by:
            if not isinstance(order_by, (tuple, list)):
                order_by = (order_by,)
            queryset = queryset.order_by(*order_by)
        if limit:
            queryset = queryset[offset: limit + offset]
        return queryset

    @staticmethod
    def get_device_type(request):
        device_type = Utils.safe_int(request.META.get("HTTP_TYPE"))
        if device_type:
            is_web = Utils.safe_int(request.META.get("HTTP_WEB"))
            is_chrome_extension = (
                Utils.safe_int(request.META.get("HTTP_CHROME_EXTENSION")) or device_type == DeviceType.CHROME_EXTENSION
            )
            if is_web:
                device_type = DeviceType.DESKTOP_WEB
                is_mobile_web = Utils.safe_int(request.META.get("HTTP_MOBILE"))
                if is_mobile_web:
                    device_type = DeviceType.MOBILE_WEB
            elif is_chrome_extension:
                device_type = DeviceType.CHROME_EXTENSION
            else:
                # #B7-5163 Split IOS and ANDROID apps
                # Default is DeviceType.MOBILE
                device_type = Utils.safe_int(request.META.get("HTTP_MOBILEAPP"), DeviceType.MOBILE)
        else:
            device_type = DeviceType.PUBLIC_API
        return device_type

    @classmethod
    def query_by_fields(cls, queryset: QuerySet, fields):
        """
        To format query result
        :param queryset: Queryset
        :param fields: Fields of audience
        :return: List
        """
        if fields:
            if not isinstance(fields, tuple):
                fields = tuple(fields)
            queryset = queryset.values(*fields)
            if len(fields) == 1:
                queryset = queryset.values_list(*fields, flat=True)
        return queryset

    @classmethod
    def chunks(cls, list_, n):
        """
        Yield successive n-sized chunks from l.
        Input: [1,2,3,4,5,6,7], 2
        Output: [1, 2], [3, 4], [5, 6], [7]
        """
        list_ = list(list_)
        for i in range(0, len(list_), n):
            yield list_[i: i + n]

    @classmethod
    def split_list(cls, list_, n):
        """
        Split a list into <n> sublists
        Input: [1,2,3,4,5,6,7], 2
        Output: [1, 2, 3, 4], [5, 6, 7]
        """
        list_ = list(list_)
        k, m = divmod(len(list_), n)
        return (list_[i * k + min(i, m): (i + 1) * k + min(i + 1, m)] for i in range(n))

    @classmethod
    def safe_json_dumps(cls, val, default=None):
        try:
            return json_dumps(cls.dict_lazy_encoder(val))
        except Exception:
            if default:
                return default
        return str(val)

    @classmethod
    def dict_lazy_encoder(cls, d):
        if isinstance(d, dict):
            new_d = d.copy()
            for k in new_d:
                new_d[k] = cls.dict_lazy_encoder(new_d[k])
            return new_d
        elif isinstance(d, list):
            new_l = []
            for e in d:
                new_l.append(cls.dict_lazy_encoder(e))
            return new_l
        elif isinstance(d, FunctionType):
            return force_str(d())
        elif isinstance(d, Promise):
            return force_str(d)
        else:
            return d

    @classmethod
    def extract_domain(cls, domain_str, strip_www=False):
        domain_str = cls.add_scheme(domain_str)
        if domain_str:
            parsed_uri = urlparse(domain_str)
            domain_str = (parsed_uri.netloc or domain_str).lower()
            if strip_www:
                domain_str = domain_str.replace("www.", "")
        return domain_str

    @classmethod
    def get_company_shortname(cls, name, remove_punction=True):
        if remove_punction:
            name = cls.replace_punction(name, replace_by="")
        name = name.upper()
        name_part = name.split()
        short_name = ""
        if len(name_part) > 1:
            for item in name_part:
                short_name += item[0]
        else:
            short_name = name[:2]
        return short_name

    @classmethod
    def fix_encoding(cls, text):
        if cls.is_ascii(text):
            return text
        else:
            from ftfy import fix_text

            return fix_text(cls.remove_soft_hyphen(text))

    @classmethod
    def get_json_object_by_path(cls, root_object, node_path):
        """
        Get a json node/value by its path
        Example:
            root_object: "{ "events": [ { "person": { "last_name": "Dong", "first_name": "Doan" } } ] }"
            node_path: "events/0/person/last_name"
            => output: Dong
        :param root_object: json object
        :param node_path: json path
        :return: json object
        """
        current_node = root_object
        with suppress(Exception):
            elements = node_path.split("/")
            for element in elements:
                if not element:
                    continue
                # Check if current node is an array
                number = cls.safe_int(element, -1)
                if number >= 0:
                    current_node = current_node[number]
                else:
                    current_node = current_node.get(element)
            return current_node
        return None

    @classmethod
    def ca_state(cls, k, get="name"):
        states = {
            "AB": "Alberta",
            "BC": "British Columbia",
            "MB": "Manitoba",
            "NB": "New Brunswick",
            "NL": "Newfoundland and Labrador",
            "NS": "Nova Scotia",
            "ON": "Ontario",
            "PE": "Prince Edward Island",
            "QC": "Quebec",
            "SK": "Saskatchewan",
            "YT": "Yukon",
            "NT": "Northwest Territories",
            "NU": "Nunavut",
        }
        if not isinstance(k, str):
            return None
        if get == "name":
            code = k.upper()
            return states[code] if (code in states) else None
        elif get == "code":
            name = cls.normalize_str(k, to_lower=True)
            for (key, val) in states.items():
                val = cls.normalize_str(val, to_lower=True)
                if name == val:
                    return key
            return None

    @classmethod
    def firstname(cls, name):
        name_parts = cls.split_names(name)
        return name_parts[0]

    @classmethod
    def lastname(cls, name, company_id: int = 0):
        name_parts = cls.split_names(name, company_id)
        return name_parts[1]

    @classmethod
    def split_names(cls, name: str, company_id: int = 0):
        with suppress(Exception):
            word_list = cls.split_words(name)
            return word_list[0], word_list[-1]
        return name, ""

    @classmethod
    def gen_search_slug(cls, jobtitle_or_keyword, location):
        slug = ""
        if jobtitle_or_keyword or location:
            if jobtitle_or_keyword and location:
                slug = cls.gen_slug(jobtitle_or_keyword) + "-jobs-in-" + cls.gen_slug(location)
            elif jobtitle_or_keyword:
                slug = cls.gen_slug(jobtitle_or_keyword) + "-jobs"
            else:
                slug = "jobs-in-" + cls.gen_slug(location)
        return slug

    @classmethod
    def get_public_url(cls, path="", *args, **kwargs):
        if path.startswith("http"):
            return path
        if settings.APP_SSL:
            protocol = "https://"
        else:
            protocol = (kwargs.pop("protocol", None) or "http") + "://"
        public_base = kwargs.pop("public_base", None) or settings.PUBLIC_BASE
        company_id = kwargs.get("company_id", 0)
        if len(path) and path[0] != "/":
            path = "/" + path
        if kwargs.pop("part", "") == "domain":
            # Return domain
            return public_base
        return protocol + public_base + path

    @classmethod
    def get_api_url(cls, path="", *args, **kwargs):
        # TODO - REMOVE
        return cls.get_public_api_url_for_external(path, **kwargs)

    @classmethod
    def extract_area_cd(cls, formatted_number):
        phone_pattern = re.compile(r"(\d{3})\D*(\d{3})\D*(\d{4})\D*(\d*)$", re.VERBOSE)
        matched = phone_pattern.search(formatted_number)
        area_cd = False
        if matched:
            area_cd = cls.safe_int(matched.groups()[0], 0)
        return area_cd

    @classmethod
    def is_the_same_plain_texts(cls, text1: str, text2: str, exclude_blank=False):
        with suppress(Exception):
            separate = "" if exclude_blank else " "
            if text1 and text2:
                # remove blank special characters
                special_characters = ["\xa0", "\ufeff"]
                for special_character in special_characters:
                    text1 = text1.replace(special_character, "")
                    text2 = text2.replace(special_character, "")
                cleaned_text1 = cls.html_cleaner(text1.lower())
                cleaned_text2 = cls.html_cleaner(text2.lower())
                # Some cases the texts look the same but the string compare is not equal
                cleaned_text1 = separate.join(cleaned_text1.split())
                cleaned_text2 = separate.join(cleaned_text2.split())
                return cleaned_text1 == cleaned_text2
        return text1 == text2

    @classmethod
    def merge_list_and_deduplicate(cls, list1, list2):
        if not (isinstance(list1, list) and isinstance(list2, list)):
            return list1
        return list(set({v.casefold(): v for v in (list1 + list2)}.values()))

    @classmethod
    def is_email(cls, email):
        with suppress(ValidationError):
            validate_email(email)
            return True
        return False

    @classmethod
    def extract_email_domain(cls, email):
        domain = ""
        try:
            if email:
                domain = email.split("@")[1].strip().lower()
        except Exception as e:
            AppLog.project.info(e)
        return domain

    @classmethod
    def clean_list(cls, data, rtn_format=str, excludes=None):
        if excludes is None:
            excludes = [0, None, "", "None", "0"]
        if not isinstance(data, (list, tuple, set)):
            data = [data]
        return cls.clean_list_id(data, rtn_format, excludes)

    @classmethod
    def clean_list_id(cls, lst=None, rtn_format: Type = str, excludes=None):
        if lst is None:
            lst = []
        if excludes is None:
            excludes = [0, None, "", "None", "0"]
        lst = filter(lambda val: val not in excludes, lst)
        return list(map(rtn_format, lst))

    @classmethod
    def html_decode(cls, s):
        """
        Returns the ASCII decoded version of the given HTML string. This does
        NOT remove normal HTML tags like <p>.
        """
        html_codes = (("'", "&#39;"), ("'", "&#x27;"), ('"', "&quot;"), (">", "&gt;"), ("<", "&lt;"), ("&", "&amp;"))
        for code in html_codes:
            s = s.replace(code[1], code[0])
        return s

    @classmethod
    def get_random_item(cls, items=[], default=""):
        if items:
            max_index = len(items) - 1
            _index = randint(0, max_index)
            _item = items[_index]
            return _item, _index
        else:
            return default, -1

    @classmethod
    def duplicate_model_instance(cls, instance, **kwargs):
        try:
            # This code avoid ValueError: Cannot force an update in save() with no primary key.
            old_data = model_to_dict(instance)
            new_instance = instance._meta.model()
            # Copy old data
            model_fields = [
                f.name + "_id" if f.get_internal_type() == "ForeignKey" else f.name for f in instance._meta.fields
            ]
            for name, value in old_data.items():
                if name in model_fields and hasattr(new_instance, name):
                    setattr(new_instance, name, value)
                else:
                    # Copy ForeignKey
                    fk_key = name + "_id"
                    if hasattr(new_instance, fk_key):
                        setattr(new_instance, fk_key, value)
            new_instance.id = None
            # New field's values
            for name, value in kwargs.items():
                setattr(new_instance, name, value)
            new_instance.save()
            return new_instance
        except Exception as ex:
            AppLog.project.debug("duplicate_model_instance failed")
            AppLog.project.exception(ex)
        return None

    @classmethod
    def get_country_by_code(cls, country_code):
        from pycountry import countries

        if len(country_code) == 3:
            country = countries.get(alpha_3=country_code)
        else:
            country = countries.get(alpha_2=country_code)
        return country

    @classmethod
    def html2text(cls, html_str, **options):
        text = html_str
        with suppress(Exception):
            if cls.is_html(html_str):
                should_strip_text = options.pop("should_strip_text", False)
                handler = HTML2Text()
                for key, val in options.items():
                    setattr(handler, key, val)
                text = handler.handle(html_str)
                return text.strip() if should_strip_text else text
        return text

    @classmethod
    def dict_deep_update(cls, dict1, dict2):
        import collections.abc

        for k, v in dict2.items():
            if isinstance(v, collections.abc.Mapping):
                dict1[k] = cls.dict_deep_update(dict1.get(k, {}), v)
            else:
                dict1[k] = v
        return dict1

    @classmethod
    def strip_string_in_dict(cls, data):
        if not isinstance(data, dict):
            return

        for (k, v) in data.items():
            if isinstance(v, str):
                data.update({k: v.strip()})
            elif isinstance(v, dict):
                cls.strip_string_in_dict(v)

    @classmethod
    def dict2xml(cls, data_dict, **kwargs):
        xml = None
        with suppress(Exception):
            xml = dicttoxml(data_dict, **kwargs)
            parser = etree.XMLParser(strip_cdata=False)
            root = etree.XML(xml, parser)
            xml = etree.tostring(
                root, encoding="UTF-8", pretty_print=True, doctype='<?xml version="1.0" encoding="UTF-8"?>'
            )
        return xml

    @classmethod
    def calculate_percentage(cls, numerator, denominator, round_number):
        if denominator:
            return round((numerator / denominator) * 100, round_number)
        return 0

    @classmethod
    def is_ascii(cls, text):
        """
        Detect all character in a string are in ascii code
        :param text:
        :return:
        """
        return all(ord(c) < 128 for c in text)

    @classmethod
    def none_p_markdown(cls, message):
        """
        Output without paragraph tags
        """
        from .markdown import markdown

        return re.sub("(<p>|</p>)", "", markdown(message), flags=re.IGNORECASE)

    @classmethod
    def iscontains_profanity(cls, text: str, min_words=2) -> bool:
        import itertools

        from better_profanity import profanity

        if not profanity.contains_profanity(text):
            combi_iter = itertools.combinations(range(len(text) + 1), 2)
            combi_texts = ["".join(text[i:j]) for i, j in combi_iter if len(text[i:j]) > min_words]
            return any(profanity.contains_profanity(_text) for _text in combi_texts)
        return True

    @classmethod
    def get_country_id(cls, phone_number):
        """
        Return country 2 letter codes of phone number
        """
        with suppress(Exception):
            pn = pn_parse(phone_number)
            # OL-62838: Fix return first region in case phone number have many region codes
            exact_country_code = cls.get_exact_phone_country_code(pn)
            if exact_country_code:
                return exact_country_code
            return region_code_for_country_code(pn.country_code)
        return "US"

    @classmethod
    def get_first_value_in_list(cls, data: list) -> Any:
        return next(iter(data), None)

    @staticmethod
    def get_phone_country_codes(phone_number) -> list:
        """
        Return country 2 letter codes of phone number
        """
        with suppress(Exception):
            from phonenumbers.phonenumberutil import region_codes_for_country_code

            pn = pn_parse(phone_number)
            return list(region_codes_for_country_code(pn.country_code))
        return ["US"]

    @staticmethod
    def get_exact_phone_country_code(phone_parser):
        """
        Method to get exact country code in case phone number have many region codes
        Ref: https://github.com/daviddrysdale/python-phonenumbers/blob/dev/python/phonenumbers/geocoder.py#L75
        """
        from phonenumbers.phonenumberutil import is_valid_number_for_region, region_codes_for_country_code

        try:
            region_codes = list(region_codes_for_country_code(phone_parser.country_code))
            if len(region_codes) == 1:
                return region_codes[0]
            return next(
                (region_code for region_code in region_codes if is_valid_number_for_region(phone_parser, region_code)),
                None,
            )
        except Exception as e:
            AppLog.error_exception(e)
        return None

    @classmethod
    def dict2obj(cls, data_dict):

        # checking whether object d is a
        # instance of class list
        if isinstance(data_dict, list):
            data_dict = [cls.dict2obj(x) for x in data_dict]

        # if d is not a instance of dict then
        # directly object is returned
        if not isinstance(data_dict, dict):
            return data_dict

        # declaring a class
        class C:
            pass

        # constructor of the class passed to obj
        obj = C()

        for k in data_dict:
            obj.__dict__[k] = cls.dict2obj(data_dict[k])

        return obj

    @staticmethod
    def vals_of_key_in_list_dict(list_of_dicts: list, key: str) -> list:
        """
        Finding the values of a key in a list of dictionaries
        Input:
            list_of_dicts = [
                {"a": 1, "b": 2, "c": 3},
                {"a": 4, "b": 5, "c": 6},
                {"a": 7, "b": 8, "c": 9}
            ]
            key = "a"
        Output:
            values_of_key = [1, 4, 7]
        """
        values_of_key = [item.get(key, None) for item in list_of_dicts]
        return values_of_key

    @staticmethod
    def safe_index(elements, element, default=None) -> int:
        with suppress(Exception):
            return elements.index(element)
        return default

    @staticmethod
    def extract_phone_location(value: str, alpha_2=False):
        from pycountry import countries

        p = pn_parse(value)
        country_code = region_code_for_country_code(p.country_code)
        if not alpha_2:
            country_code = countries.get(alpha_2=country_code).alpha_3
        return p.country_code, country_code, p.national_number

    @staticmethod
    def add_any_room_options(rooms, job_loc_id):
        if len(rooms):
            anyRoom = dict(name=_("Any available room"), id=-1, job_loc_id=job_loc_id)
            return [anyRoom] + rooms
        return rooms
