from django.db import models


class TinyIntegerField(models.SmallIntegerField):
    def db_type(self, connection):
        return "tinyint"


class PositiveTinyIntegerField(models.PositiveSmallIntegerField):
    def db_type(self, connection):
        return "tinyint unsigned"


class NormalTextField(models.TextField):
    def db_type(self, connection):
        return "text"


class MediumTextField(models.TextField):
    def db_type(self, connection):
        return "MEDIUMTEXT"


class SimpleDateTimeField(models.DateTimeField):
    # OL-60987 when datetime field not use for pk or index, we should use datetime(0).
    # django's DateTimeField use datetime(6)
    def db_type(self, connection):
        return "datetime"
