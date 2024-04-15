class HttpMethod:
    GET = "get"
    POST = "post"
    PUT = "put"
    DELETE = "delete"
    HEAD = "head"
    OPTIONS = "options"
    PATCH = "patch"

    @classmethod
    def is_get(cls, method: str):
        return method.lower() == cls.GET

    @classmethod
    def is_post(cls, method: str):
        return method.lower() == cls.POST

    @classmethod
    def is_put(cls, method: str):
        return method.lower() == cls.PUT

    @classmethod
    def is_delete(cls, method: str):
        return method.lower() == cls.DELETE

    @classmethod
    def is_head(cls, method: str):
        return method.lower() == cls.HEAD

    @classmethod
    def is_options(cls, method: str):
        return method.lower() == cls.OPTIONS

    @classmethod
    def is_patch(cls, method: str):
        return method.lower() == cls.PATCH

    @classmethod
    def is_valid(cls, method: str):
        return method.lower() in cls.__dict__.values()
