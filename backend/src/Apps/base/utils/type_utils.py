from contextlib import suppress
from json import dumps as json_dumps
from json import loads as json_loads


class TypeUtils:
    @classmethod
    def safe_cast(cls, val, to_type, default=None):
        """Safely cast value to type, and if failed, returned default if exists.
            If default is 'None' and and error occurs, it is raised.

        Args:
            val:
            to_type:
            default:

        Returns:

        """
        if val is None:
            return default

        try:
            return to_type(val)
        except ValueError:
            if default is None:
                raise
            return default

    @classmethod
    def safe_str(cls, val, default=""):
        """Safely cast value to str, Optional: Pass default value. Returned if casting fails.

        Args:
            val:
            default:

        Returns:

        """
        if val is None:
            return default if default is not None else ''

        return cls.safe_cast(val, str, default)

    @classmethod
    def safe_float(cls, val, ndigits=10, default=None):
        """Safely cast value to float, remove ',' if exists to ensure strs like: "1,234.5" are handled
            Optional: Pass default value. Returned if casting fails.

        Args:
            val:
            ndigits:
            default:

        Returns:

        """
        if val is None:
            return default if default is not None else 0.0

        _val = val.replace(',', '') if type(val) == str else val
        return round(cls.safe_cast(_val, float, default), ndigits)

    @classmethod
    def safe_int(cls, val, default=0):
        """Safely cast value to int. Optional: Pass default value. Returned if casting fails.

        Args:
            val:
            default:

        Returns:

        """
        if val is None:
            return default if default is not None else 0

        return cls.safe_cast(cls.safe_float(val, ndigits=0, default=default), int, default)

    @classmethod
    def safe_dict(cls, val, default=None):
        """Safely cast value to dict. Optional: Pass default value. Returned if casting fails.

        Args:
            val:
            default:

        Returns:

        """
        if val is None:
            return default if default is not None else {}

        return cls.safe_cast(val, dict, default)

    @classmethod
    def safe_smart_cast(cls, val):
        """Safely cast value, default str

        Args:
            val:

        Returns:

        """
        to_type = type(val)
        if to_type == str:
            return cls.safe_str(val)
        if to_type == dict:
            return cls.safe_dict(val)
        if to_type == int:
            return cls.safe_int(val)
        if to_type == float:
            return cls.safe_float(val)

        return cls.safe_str(str(val))

    @staticmethod
    def safe_jsonloads(val, default=None):
        def dict_raise_on_duplicates(ordered_pairs):
            """Convert duplicate keys to JSON array."""
            d = {}
            for k, v in ordered_pairs:
                if k in d:
                    if type(d[k]) is list:
                        d[k].append(v)
                    else:
                        d[k] = [d[k], v]
                else:
                    d[k] = v
            return d

        with suppress(Exception):
            return json_loads(val, object_pairs_hook=dict_raise_on_duplicates)
        return {} if default is None else default
