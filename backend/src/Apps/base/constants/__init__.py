
__author__ = "minhhoangho99@gmail.com"
__date__ = "Oct 06, 2023 14:10"


class const:
    class ConstError(TypeError):
        pass  # base exception class

    class ConstCaseError(ConstError):
        pass

    def __setattr__(self, name, value):
        if name in self.__dict__:
            raise self.ConstError("Can't change const.%s" % name)
        if not name.isupper():
            raise self.ConstCaseError("const name %r is not all uppercase" % name)
        self.__dict__[name] = value
