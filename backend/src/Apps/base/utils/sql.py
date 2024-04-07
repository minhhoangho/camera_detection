from collections import OrderedDict, namedtuple

import MySQLdb
from django.conf import settings
from django.db import connection
from django.db.utils import OperationalError
from src.Apps.base.logging.application_log import AppLog


class SQLUtils:

    @classmethod
    def call_procedure(cls, stored_name, query_param, cursor=None, return_dict=False, execute_only=False):
        results = []
        try:
            if not cursor:
                cursor = connection.cursor()
            if query_param:
                cursor.callproc(stored_name, query_param)
            else:
                cursor.callproc(stored_name)
            if execute_only:
                return {} if return_dict else results
            cols = [col[0] for col in cursor.description]
            rows = cursor.fetchall()
            if return_dict:
                # It's helpful in-case you want to return whole result to UI
                results = [dict(zip(cols, row)) for row in rows]
            else:
                nt_result = namedtuple("Result", cols)
                results = [nt_result(*row) for row in rows]
        except Exception as ex:
            AppLog.error_exception(ex)
        finally:
            if cursor:
                cursor.close()
        return results

    @classmethod
    def do_raw_query(
        cls,
        sql,
        query_param=[],
        cursor=None,
        return_dict=False,
        debug_log=False,
        execute_only=False,
        raise_exception=False,
    ):
        results = []
        _cursor = cursor or connection.cursor()
        try:
            if query_param:
                _cursor.execute(sql, query_param)
            else:
                _cursor.execute(sql)
            if debug_log:
                AppLog.project.warn(f"RAW QUERY {sql} - {query_param}")
            if execute_only:
                return {} if return_dict else results
            cols = [col[0] for col in _cursor.description]
            rows = _cursor.fetchall()
            if return_dict:
                # It's helpful in-case you want to return whole result to UI
                results = [dict(zip(cols, row)) for row in rows]
            else:
                nt_result = namedtuple("Result", cols)
                results = [nt_result(*row) for row in rows]
        except Exception as ex:
            if raise_exception:
                raise ex
            AppLog.error_exception(ex)
            if settings.DEBUG or isinstance(ex, OperationalError):
                AppLog.project.error(f"RAW QUERY {sql} - {query_param}")
        finally:
            if not cursor:
                _cursor.close()
        return results

    @classmethod
    def raw_sql_result_2_dict(cls, raw_res, excludes=[]):
        data = vars(raw_res)
        data.pop("_state", None)
        for key in excludes:
            data.pop(key, None)
        return data


    @staticmethod
    def sql_escape_str(input_str):
        """
        Return input_str after escaped with MySQL escape_string
        """
        return f"{MySQLdb.escape_string(input_str).decode()}"

    @staticmethod
    def format_sql_escape_str(sql_query, params):
        """
        Escape all values which have str type in params
        Return sql format with all str escaped
        """
        escape_params = {}
        for k, vl in params.items():
            if type(vl) is str:
                escape_params[k] = MySQLdb.escape_string(vl).decode()
            else:
                escape_params[k] = vl
        return sql_query.format(**escape_params)
