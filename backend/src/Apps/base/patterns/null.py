class _Null:
    """See: http://en.wikipedia.org/wiki/Null_Object_pattern"""

    def __init__(self, _unicode="", _repr="Null"):
        self.__dict__["_unicode"] = _unicode
        self.__dict__["_str"] = _unicode
        self.__dict__["_repr"] = _repr

    def __unicode__(self):
        return self.__getattribute__("_unicode")

    def __str__(self):
        return self.__getattribute__("_str")

    def __repr__(self):
        return self.__getattribute__("_repr")

    def __nonzero__(self):
        return False

    def __len__(self):
        return 0

    def __getattr__(self, attr):
        if attr == "tolist":
            raise AttributeError
        return self

    def __setattr__(self, attr, value):
        pass

    def __getitem__(self, item):
        return self

    def __setitem__(self, item, value):
        pass

    def __delitem__(self, item):
        pass

    def __call__(self, *args, **kwargs):
        return self

    def __iter__(self):
        return self

    def next(self):
        raise StopIteration

    __next__ = next


class NullContext:
    def __enter__(self):
        return self

    def __exit__(self, *exc_info):
        pass


unset = _Null(_unicode="unset", _repr="unset")
Null = _Null()
