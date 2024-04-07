

__author__ = "minhhoangho99@gmail.com"
__date__ = "Oct 06, 2023 15:04"

import collections.abc
import contextlib
import uuid
from functools import wraps

from django.core.exceptions import EmptyResultSet
from django.db.models.deletion import SET_NULL
from django.db.models.fields.related import ForeignObject
from django.db.models.options import Options
from django.db.models.query import QuerySet
from django.db.models.signals import post_save, pre_save
from django.db.models.sql.constants import INNER
from django.db.models.sql.datastructures import Join
from django.db.models.sql.where import ExtraWhere, WhereNode
from django.db.utils import DEFAULT_DB_ALIAS

class CustomJoin(Join):
    def __init__(self, subquery, subquery_params, parent_alias, table_alias, join_type, join_field, nullable):
        self.subquery_params = subquery_params
        self.custom_join_type = join_type
        super().__init__(subquery, parent_alias, table_alias, join_type, join_field, nullable)

    def as_sql(self, compiler, connection):
        """
        Generates the full
        LEFT OUTER JOIN (somequery) alias ON alias.somecol = othertable.othercol, params
        clause for this join.
        """
        params = []
        sql = []
        alias_str = "" if self.table_alias == self.table_name else (" %s" % self.table_alias)
        params.extend(self.subquery_params)
        qn = compiler.quote_name_unless_alias
        qn2 = connection.ops.quote_name
        sql.append(f"{self.custom_join_type} ({self.table_name}){alias_str} ON (")
        for index, (lhs_col, rhs_col) in enumerate(self.join_cols):
            if index:
                sql.append(" AND ")
            if "." not in lhs_col:
                lhs_col = f"{qn(self.parent_alias)}.{qn2(lhs_col)}"
            sql.append(
                "%s = %s.%s"
                % (
                    lhs_col,
                    qn(self.table_alias),
                    qn2(rhs_col),
                )
            )
        extra_cond = self.join_field.get_extra_restriction(self.table_alias, self.parent_alias)
        if extra_cond:
            extra_sql, extra_params = compiler.compile(extra_cond)
            extra_sql = "AND (%s)" % extra_sql
            params.extend(extra_params)
            sql.append("%s" % extra_sql)
        sql.append(")")
        return " ".join(sql), params



class BaseQuerySet(QuerySet):
    def delete(self, *args, **kwargs):
        return super().delete(*args, **kwargs)

    def join_to(self, subquery, subquery_field, table_field, alias, **kwargs):
        """
        Add a join on `subquery` to `queryset` (having table `table`).
        join_type can be `INNER` or `LOUTER` (LEFT OUTER JOIN)
        """
        try:
            # here you can set complex clause for join
            def extra_join_cond(alias, related_alias):
                if (alias, related_alias) == ("[sys].[columns]", "[sys].[database_permissions]"):
                    where = "[sys].[columns].[column_id] = " "[sys].[database_permissions].[minor_id]"
                    children = [ExtraWhere([where], ())]
                    return WhereNode(children)
                return None

            db = kwargs.get("db", DEFAULT_DB_ALIAS)
            model = self.model
            join_type = kwargs.get("join_type", INNER)
            extra_restriction_func = kwargs.get("extra_restriction_func", None)
            if not callable(extra_restriction_func):
                extra_restriction_func = extra_join_cond
            foreign_object = ForeignObject(
                to=subquery, from_fields=[None], to_fields=[None], rel=None, on_delete=SET_NULL
            )
            foreign_object.opts = Options(model._meta)
            foreign_object.opts.model = model
            foreign_object.get_joining_columns = lambda: ((table_field, subquery_field),)
            foreign_object.get_extra_restriction = extra_restriction_func
            subquery_sql, subquery_params = subquery.query.get_compiler(using=db).as_sql()
            join = CustomJoin(
                subquery_sql, subquery_params, model._meta.db_table, alias, join_type, foreign_object, False
            )

            self.query.join(join)

            # hook for set alias
            join.table_alias = alias
            self.query.external_aliases.update({alias: alias})

            return self
        except EmptyResultSet:
            return self.none()

    def bulk_create(self, objs, batch_size=None, ignore_conflicts=False, **kwargs):
        with contextlib.suppress(Exception):
            getattr(objs[0], "uuid")
            for o in objs:
                _uuid = uuid.uuid4()
                if kwargs.get("keep_uuid") and o.uuid:
                    with contextlib.suppress(Exception):
                        _uuid = o.uuid if isinstance(o.uuid, uuid.UUID) else uuid.UUID(o.uuid)
                o.uuid = _uuid
        if kwargs.get("pre_save_signal"):
            for i in objs:
                pre_save.send(i.__class__, instance=i, raw=None)
        result = super().bulk_create(objs, batch_size=batch_size, ignore_conflicts=ignore_conflicts)
        if kwargs.get("trigger_signal") and kwargs.get("filters"):
            _model = objs[0].__class__
            filters = kwargs.get("filters")
            if isinstance(filters, collections.abc.Mapping):
                created_objs = _model.objects.filter(**filters)
            else:
                created_objs = _model.objects.filter(filters)
            for i in created_objs:
                post_save.send(i.__class__, instance=i, created=True, raw=None)
        return result



def bulk_update(objs, **kwargs):
    # Override bulk_update method in helper to support translation
    # Currently Django 3.x support objects.bulk_update()
    # But I got some weird issues, especially performance. will try to look at it later
    exclude_fields = kwargs.get("exclude_fields", [])
    trigger_signal = kwargs.get("trigger_signal", False)
    post_save_signal = kwargs.get("post_save_signal", False)

    if objs:
        from aicore.models import RCacheModel

        _model_object = objs[0]
        if hasattr(_model_object, "bulk_save_translation"):
            # Exclude translate fields to make sure we don't translate the base object
            translated_fields = _model_object.bulk_save_translation(objs, **kwargs)
            exclude_fields += translated_fields
        if trigger_signal and not post_save_signal:
            for i in objs:
                pre_save.send(i.__class__, instance=i, raw=None)

        from ai_api.services import Utils

        update_fields = Utils.list_diff(exclude_fields, kwargs.get("update_fields", []))
        with contextlib.suppress(Exception):
            getattr(_model_object, "uuid")
            exclude_fields.append("uuid")

        result = dj_bulk_update(
            objs,
            meta=kwargs.get("meta", None),
            update_fields=update_fields,
            exclude_fields=exclude_fields,
            using=kwargs.get("using", "default"),
            batch_size=kwargs.get("batch_size", None),
            pk_field=kwargs.get("pk_field", "pk"),
        )

        if isinstance(_model_object, RCacheModel) and kwargs.get("forget_cache"):
            _model_object.__class__.cache_forget_objs(objs)

        if trigger_signal and post_save_signal:
            for i in objs:
                post_save.send(i.__class__, instance=i, created=True, raw=None)

        return result
    return None
