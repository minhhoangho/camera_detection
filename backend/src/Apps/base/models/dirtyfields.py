from contextlib import contextmanager
from typing import Any

from dirtyfields.dirtyfields import DirtyFieldsMixin, reset_state


class CustomDirtyFieldsMixin(DirtyFieldsMixin):
    @contextmanager
    def before_set_cache(self: Any):
        """
        _original_state is used by django-dirtyfields to keep track of state of data
        we don't need to cache it so we clean here
        """
        state_fields = ["_original_state"]
        backup_vals = {f: getattr(self, f, None) for f in state_fields}
        [setattr(self, f, None) for f in state_fields if hasattr(self, f)]
        yield
        [setattr(self, f, backup_vals.get(f, None)) for f in state_fields if hasattr(self, f)]

    def after_get_cache(self: Any):
        """
        _original_state is used by django-dirtyfields to keep track of state of data
        we re-populate it when we retrieve from cache so that the DirtyFieldsMixin's functions can work
        """
        try:
            reset_state(sender=self.__class__, instance=self)
        except:
            self._original_state = {}

    def save(self, *args, **kwargs):
        """
        Not support saving with related (foreign key) objects atm
        """
        # noinspection PyUnresolvedReferences
        is_update = bool(self.pk)
        skip_save = False
        if is_update:
            if "update_fields" not in kwargs:
                self.get_update_fields(kwargs)
            if not kwargs.get("update_fields"):
                # This is the case of using dirty fields and calling save() (to update) when nothing changed.
                # Django itself will do nothing: https://github.com/django/django/blob/stable/4.1.x/django/db/models/base.py#L779-L780
                # So we skip calling the save() here to avoid redundant behavior such as removing the cache
                skip_save = True
        if not skip_save:
            super().save(*args, **kwargs)

    def get_update_fields(self, kwargs):
        """
        Get update_fields
        - Pass kwargs as value to be able to override update_fields
        :param kwargs:
        :return:
        """
        try:
            dirty_fields = self.get_dirty_fields(check_relationship=True)
            kwargs["update_fields"] = dirty_fields.keys()
        except:
            pass

    @classmethod
    def purge_initial_states(cls, objects):
        purge_fields = ["_original_state"]
        [setattr(obj, f, None) for f in purge_fields for obj in objects if hasattr(obj, f)]
