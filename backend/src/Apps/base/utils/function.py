from functools import wraps
from typing import Callable

from django.db import transaction

from src.Apps.base.logging.application_log import AppLog
from src.Apps.base.utils.main import Utils


def safe_executor(with_transaction=False, re_raise=False, default=None, with_log=False):
    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            kwargs.update(with_transaction=with_transaction, re_raise=re_raise, default=default, with_log=with_log)
            return safe_execute(func, *args, **kwargs)

        return wrapped

    return decorator


def safe_execute(func, *args, **kwargs):
    with_transaction = kwargs.pop("with_transaction", False)
    re_raise = kwargs.pop("re_raise", False)
    default = kwargs.pop("default", None)
    with_log = kwargs.pop("with_log", True)
    try:
        if with_transaction:
            with transaction.atomic():
                result = func(*args, **kwargs)
        else:
            result = func(*args, **kwargs)
    except Exception as e:
        if with_log:

            AppLog.project.exception(e)
        if re_raise:
            raise e
        return default
    return result


def skip_execute(when: Callable, default=None):
    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            try:
                if when(*args, **kwargs):
                    return default
            except:
                pass
            return func(*args, **kwargs)

        return wrapped

    return decorator


def error_interceptor(catch=Exception, reraise=None, with_log=False, err_msg=None):
    """Intercept an error and either re-raise

    :param Type[Exception] catch: an exception to intercept
    :param Union[bool, Type[Exception]] reraise: if provided, will re-raise the provided exception.
    :param bool with_log: if `True`` will log exception
    :param str err_msg: if included will be used to instantiate the exception.

    Usage: @error_interceptor(catch=Exception, reraise=AnotherException, with_log=True)
    """

    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except catch as ex:

                _err_msg = err_msg or str(ex)
                if with_log:
                    AppLog.error_exception(
                        f"Calling {func.__name__} with arguments {args} and {kwargs} error by {_err_msg}"
                    )
                if isinstance(reraise, bool) and reraise:
                    raise
                if callable(reraise):
                    new_exc = reraise(_err_msg)
                    raise new_exc from ex

        return wrapped

    return decorator


def fetch_in_chunk(chunk_size=1000):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):

            result = []
            list_items = kwargs.get("list_items", [])
            for sub_list in Utils.chunks(list_items, chunk_size):
                kwargs["list_items"] = sub_list
                result += list(func(*args, **kwargs))
            return result

        return wrapper

    return decorator


def delete_in_chunk(chunk_size=2000):
    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):

            list_items = kwargs.get("list_items", [])
            for sub_list in Utils.chunks(list_items, chunk_size):
                kwargs["list_items"] = sub_list
                func(*args, **kwargs)

        return wrapped

    return decorator


def query_iterator_by_id(chunk_size=1000, chunk_by="id"):
    """
    Decorator to create a generator that retrieves data in chunks from the decorated function.

    Args:
        chunk_by (str): The attribute to use for chunking, e.g., "table_name.id".
        chunk_size (int): The size of each chunk.

    Returns:
        Callable: The decorator that wraps the target function.
    """

    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):


            # Extract the attribute name from chunk_by, e.g., "id" from "table_name.id"
            attr_in_result = chunk_by.split(".")[-1]
            start_with: int = 0
            sort_by = f"ORDER BY {chunk_by} ASC"
            chunk_limit = f"LIMIT {chunk_size}"

            while True:
                chunk_filter = ""

                if start_with:
                    # Get next chunk data from last id of previous data
                    chunk_filter = f"AND {chunk_by} > {start_with}"

                kwargs["chunk_by_id"] = f"{chunk_filter} {sort_by} {chunk_limit}"
                items = func(*args, **kwargs)

                returned = len(items)

                if returned:
                    try:
                        last_item = items[-1]
                        start_with = Utils.safe_int(last_item[attr_in_result])
                    except (KeyError, TypeError):
                        raise ValueError(f"`{chunk_by}` field should be in returned objects.")

                    yield items

                if returned < chunk_size:
                    break

        return wrapped

    return decorator


def fetch_by_iterator(iterator_callback=None):
    """
    Decorator to collect results from a queryset iterator.
    Args:
        iterator_callback: The function to iterate over the queryset results. Defaults to queryset_iterator_sorting.
    Returns:
        A decorator that applies the specified iterator_callback to the queryset results.
    """

    def decorator(func):
        @wraps(func)
        def wrapped(*args, **kwargs):
            qs_iterator = func(*args, **kwargs)
            if iterator_callback:
                qs_iterator = iterator_callback(qs_iterator)
            ret = []
            for chunk_data in qs_iterator:
                if isinstance(chunk_data, tuple):
                    chunk_data, *_ = chunk_data
                ret.extend(chunk_data)
            return ret

        return wrapped

    return decorator
